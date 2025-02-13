import { defineSecret } from "firebase-functions/params";

export enum SecretKeys {
  TG_BOT_API_KEY = "tg_bot_api_key",
  TG_WEBHOOK_SECRET_TOKEN = "tg_webhook_secret_token",
  API_KEY_HMAC_SECRET = "api_key_hmac_secret",
  ALCHEMY_API_KEY = "alchemy_api_key",
}

export const tgBotAPIKey = defineSecret(SecretKeys.TG_BOT_API_KEY);
export const tgWebhookSecretToken = defineSecret(
  SecretKeys.TG_WEBHOOK_SECRET_TOKEN
);
export const apiKeyHMACSecret = defineSecret(SecretKeys.API_KEY_HMAC_SECRET);
export const alchemyAPIKey = defineSecret(SecretKeys.ALCHEMY_API_KEY);
