import { defineString } from "firebase-functions/params";

export const projectID = process.env.GOOGLE_CLOUD_PROJECT;

export enum EnvironmentConfigKeys {
  /**
   * Google Key Management Service (KMS) location.
   */
  KMS_LOCATION = "kms_location",
  /**
   * KMS keyring name for the project
   */
  KMS_KEYRING = "kms_keyring",
  /**
   * Key name for the secret that encrypts private keys
   */
  KMS_PRIVATE_KEY_ENCRYPTOR = "private_key_encryptor",
  /**
   * Key name for the secret that encrypts client webhook secrets
   */
  KMS_WEBHOOK_SECRET_ENCRYPTOR = "webhook_secret_encryptor",
  /**
   *
   */
  DAO_FEE_COLLECTION_EVM_ADDRESS = "dao_fee_collection_address",
}

export const kmsLocation = defineString(EnvironmentConfigKeys.KMS_LOCATION);
export const kmsKeyringName = defineString(EnvironmentConfigKeys.KMS_KEYRING);
export const kmsPrivateKeyEncryptorName = defineString(
  EnvironmentConfigKeys.KMS_PRIVATE_KEY_ENCRYPTOR
);
export const kmsWebhookSecretEncryptorName = defineString(
  EnvironmentConfigKeys.KMS_WEBHOOK_SECRET_ENCRYPTOR
);
export const daoFeeCollectionEVMAddress = defineString(
  EnvironmentConfigKeys.DAO_FEE_COLLECTION_EVM_ADDRESS
);
