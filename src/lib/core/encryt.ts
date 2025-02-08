import { logger } from "firebase-functions";
import { EncryptedPrivateKey, PrivateKey } from "../types";
import {
  kmsKeyringName,
  kmsLocation,
  kmsPrivateKeyEncryptorName,
  kmsWebhookSecretEncryptorName,
  gcpProjectID,
} from "./config";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import { StringParam } from "firebase-functions/lib/params/types";

interface EncryptConfig {
  projectID: string;
  location: string;
  keyRingName: string;
  keyName: string;
}

const kmsClient = new KeyManagementServiceClient();

export const encryptWalletPrivateKey = async (
  privateKey: PrivateKey
): Promise<EncryptedPrivateKey> => {
  const config = await getEncryptConfig(kmsPrivateKeyEncryptorName);

  const encryptedPrivateKey = await encryptString(privateKey, config);
  return encryptedPrivateKey as EncryptedPrivateKey;
};

export const encryptWebhookSecret = async (secret: string): Promise<string> => {
  const config = await getEncryptConfig(kmsWebhookSecretEncryptorName);

  return encryptString(secret, config);
};

interface EncryptConfig {
  projectID: string;
  location: string;
  keyRingName: string;
  keyName: string;
}

export const encryptString = async (
  privateKey: string,
  config: EncryptConfig
): Promise<string> => {
  logger.info("Encrypting string", { config });

  const keyName = kmsClient.cryptoKeyPath(
    config.projectID,
    config.location,
    config.keyRingName,
    config.keyName
  );
  const plaintextBuffer = Buffer.from(privateKey, "utf8");

  const [encryptResponse] = await kmsClient.encrypt({
    name: keyName,
    plaintext: plaintextBuffer,
  });

  if (!encryptResponse.ciphertext) {
    throw new Error("Encryption failed: no ciphertext returned.");
  }

  return Buffer.from(encryptResponse.ciphertext).toString("base64");
};

export const getEncryptConfig = async (keyNameVariable: StringParam) => {
  const config: EncryptConfig = {
    projectID: gcpProjectID.value(),
    location: kmsLocation.value(),
    keyRingName: kmsKeyringName.value(),
    keyName: keyNameVariable.value(),
  };

  return config;
};
