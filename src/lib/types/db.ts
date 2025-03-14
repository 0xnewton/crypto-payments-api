import { Brand } from "./utils";

export enum DBCollections {
  Organizations = "Organizations",
  APIKeys = "APIKeys",
  Users = "Users",
  Wallets = "Wallets",
  OrganizationConfig = "OrganizationConfig",
  WalletWebhooks = "WalletWebhooks",
  WebhookReceipts = "WebhookReceipts",
}

export type OrganizationID = Brand<string, "OrganizationID">;
export type UserID = Brand<string, "UserID">;
export type APIKeyID = Brand<string, "APIKeyID">;
export type TelegramUserID = Brand<number, "TelegramUserID">;
export type WalletID = Brand<string, "WalletID">;
export type EncryptedPrivateKey = Brand<string, "EncryptedPrivateKey">;
export type OrganizationConfigID = "config";
export type WalletWebhookID = Brand<string, "WalletWebhookID">;
export type WebhookReceiptID = Brand<string, "WebhookReceiptID">;

export type UnixTimestamp = number; // Unix time in ms
