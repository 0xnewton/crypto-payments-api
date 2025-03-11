import { defineSecret } from "firebase-functions/params";

export enum SecretKeys {
  TG_BOT_API_KEY = "tg_bot_api_key",
  TG_WEBHOOK_SECRET_TOKEN = "tg_webhook_secret_token",
  API_KEY_HMAC_SECRET = "api_key_hmac_secret",
  /** API Key for Alchemy App */
  ALCHEMY_API_KEY = "alchemy_api_key",
  /** Alchemy Notifcations API */
  ALCHEMY_AUTH_TOKEN = "alchemy_auth_token",
  ALCHEMY_SIGNING_TOKEN = "alchemy_signing_token",
}

export const tgBotAPIKey = defineSecret(SecretKeys.TG_BOT_API_KEY);
export const tgWebhookSecretToken = defineSecret(
  SecretKeys.TG_WEBHOOK_SECRET_TOKEN
);
export const apiKeyHMACSecret = defineSecret(SecretKeys.API_KEY_HMAC_SECRET);
export const alchemyAPIKey = defineSecret(SecretKeys.ALCHEMY_API_KEY);
export const alchemyAuthToken = defineSecret(SecretKeys.ALCHEMY_AUTH_TOKEN);
export const alchemySigningToken = defineSecret(
  SecretKeys.ALCHEMY_SIGNING_TOKEN
);
