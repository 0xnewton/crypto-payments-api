import { logger } from "firebase-functions";
import { generateAPIKey, hashWithHMAC } from "../../lib/core";
import { OrganizationID, UserID } from "../../lib/types";
import { createAPIKey, getAPIKeyByHash, getAPIKeyCount } from "../db";
import { APIKey } from "../types";

const DEFAULT_MAX_API_KEYS = 10;

export interface CreateAPIKeyParams {
  userID: UserID;
  organizationID: OrganizationID;
}

export interface CreateAPIKeyResponse {
  key: APIKey;
  secretValue: string;
}
export const create = async (
  params: CreateAPIKeyParams
): Promise<CreateAPIKeyResponse> => {
  logger.info("Create API service request hit", { params });
  const secretValue = generateAPIKey();
  const hash = hashWithHMAC(secretValue);
  // Make sure it does not exist
  const [existingKey, keyCount] = await Promise.all([
    getAPIKeyByHash({ hash }),
    getAPIKeyCount(params.organizationID),
  ]);
  if (existingKey) {
    logger.error("API Key already exists", { hash });
    throw new Error("Something went wrong!");
  }
  const maxKeyCount = DEFAULT_MAX_API_KEYS;
  if (keyCount >= maxKeyCount) {
    logger.debug("Organization has reached max API key count", {
      keyCount,
      max: maxKeyCount,
    });
    throw new Error(
      `Your organization has reached the maximum number of API keys: ${maxKeyCount}`
    );
  }

  const apiKey = await createAPIKey({
    organizationID: params.organizationID,
    createdBy: params.userID,
    hash,
  });
  logger.info("Created API Key", {
    id: apiKey.id,
    userID: apiKey.createdBy,
    organizationID: apiKey.organizationID,
  });

  return { key: apiKey, secretValue };
};
