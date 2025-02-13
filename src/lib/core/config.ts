import {
  defineString,
  projectID as gcpProjectID,
} from "firebase-functions/params";

export enum EnvironmentConfigKeys {
  /**
   * Google Key Management Service (KMS) location.
   */
  KMS_LOCATION = "KMS_LOCATION",
  /**
   * KMS keyring name for the project
   */
  KMS_KEYRING = "KMS_KEYRING",
  /**
   * Key name for the secret that encrypts private keys
   */
  KMS_PRIVATE_KEY_ENCRYPTOR = "KMS_PRIVATE_KEY_ENCRYPTOR",
  /**
   * Key name for the secret that encrypts client webhook secrets
   */
  KMS_WEBHOOK_SECRET_ENCRYPTOR = "KMS_WEBHOOK_SECRET_ENCRYPTOR",
  /**
   *
   */
  DAO_TREASURY_EVM_ADDRESS = "DAO_TREASURY_EVM_ADDRESS",
  WALLET_WEBHOOK_URL = "WALLET_WEBHOOK_URL",
}

export { gcpProjectID };
export const kmsLocation = defineString(EnvironmentConfigKeys.KMS_LOCATION);
export const kmsKeyringName = defineString(EnvironmentConfigKeys.KMS_KEYRING);
export const kmsPrivateKeyEncryptorName = defineString(
  EnvironmentConfigKeys.KMS_PRIVATE_KEY_ENCRYPTOR
);
export const kmsWebhookSecretEncryptorName = defineString(
  EnvironmentConfigKeys.KMS_WEBHOOK_SECRET_ENCRYPTOR
);
export const daoTreasuryEVMAddress = defineString(
  EnvironmentConfigKeys.DAO_TREASURY_EVM_ADDRESS
);
export const walletWebhookURL = defineString(
  EnvironmentConfigKeys.WALLET_WEBHOOK_URL
);
