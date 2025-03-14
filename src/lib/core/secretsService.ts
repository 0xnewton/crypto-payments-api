import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { logger } from "firebase-functions";
import { getProjectID } from "./platform";

const client = new SecretManagerServiceClient();

interface SecretPayload {
  webhookID: string;
  value: string;
}

/**
 * Gets a secret from GSM
 * @param secretID ID of the secret like "my-secret"
 * @returns the secret value
 */
const getSecret = async (secretID: string): Promise<string> => {
  const projectID = getProjectID();
  const secretName = getSecretResourceName(secretID, projectID, "latest");
  const [accessResponse] = await client.accessSecretVersion({
    name: secretName,
  });
  if (!accessResponse.payload?.data) {
    logger.error("No data found for secret", { secretName });
    throw new Error("No data found for secret");
  }
  return accessResponse.payload.data.toString();
};

const createSecret = async (
  secretId: string, // Secret ID like, "my-secret"
  secretValue: string
): Promise<string> => {
  logger.info("Creating secret", { secretId });

  const projectID = getProjectID();

  await client.createSecret({
    parent: `projects/${projectID}`,
    secretId,
    secret: {
      replication: {
        automatic: {},
      },
    },
  });

  const secretNameFull = `projects/${projectID}/secrets/${secretId}`;
  const [version] = await client.addSecretVersion({
    parent: secretNameFull,
    payload: {
      data: Buffer.from(secretValue, "utf8"),
    },
  });

  logger.info("Created secret version", {
    version: version.name,
    secretNameFull,
  });

  return secretNameFull;
};

const deleteSecret = async (secretID: string): Promise<void> => {
  const projectID = getProjectID();
  const secretName = getSecretResourceName(secretID, projectID);
  await client.deleteSecret({ name: secretName });
};

export const deleteWebhookSigningKey = async (
  webhookID: string
): Promise<void> => {
  const secretID = constructWebhookSigningKeySecretID(webhookID);
  return deleteSecret(secretID);
};

export const getWebhookSigningKey = async (
  webhookID: string
): Promise<string> => {
  const secretID = constructWebhookSigningKeySecretID(webhookID);
  return getSecret(secretID);
};

export const createWebhookSigningKey = async (
  secretPayload: SecretPayload
): Promise<string> => {
  const secretBaseName = constructWebhookSigningKeySecretID(
    secretPayload.webhookID
  );
  return createSecret(secretBaseName, secretPayload.value);
};

export const constructWebhookSigningKeySecretID = (
  webhookID: string
): string => {
  return `webhook_signing_key_${webhookID}`;
};

// Helper function to generate the full secret resource name
const getSecretResourceName = (
  secretID: string,
  projectID: string,
  version = "latest"
): string => {
  return `projects/${projectID}/secrets/${secretID}/versions/${version}`;
};
