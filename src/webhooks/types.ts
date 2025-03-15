import { Request } from "express-serve-static-core";
import {
  Address,
  NetworkEnum,
  OrganizationID,
  SentWebhookReceiptID,
  UnixTimestamp,
  WalletID,
  WalletWebhookID,
  WebhookReceiptID,
} from "../lib/types";

export interface WalletWebhook {
  id: WalletWebhookID;
  alchemyWebhookID: string;
  network: NetworkEnum;
  webhookURL: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  deletedAt: UnixTimestamp | null;
  walletCount: number;
}

export interface AlchemyRequest extends Request {
  alchemy: {
    rawBody: string;
    signature: string;
  };
}

export interface AlchemyWebhookEvent {
  webhookId: string;
  id: string;
  createdAt: Date;
  type: AlchemyWebhookType;
  event: Record<any, any>;
}

export type AlchemyWebhookType =
  | "MINED_TRANSACTION"
  | "DROPPED_TRANSACTION"
  | "ADDRESS_ACTIVITY";

export interface WebhookReceipt {
  id: WebhookReceiptID;
  createdAt: UnixTimestamp;
  webhookID: WalletWebhookID;
  alchemyWebhookID: string;
  eventID: string;
  eventType: AlchemyWebhookType;
  contractAddress: Address;
  contractDecimals: number;
  fromAddress: Address;
  toAddress: Address;
  rawValue: string;
  value: number;
  hash: string;
  category: string;
  asset: string;
  blockNum: string;
  chain: NetworkEnum;
}

export interface WebhookPayload {
  receivingAddress: Address;
  eventID: string;
  contractAddress: Address;
  contractDecimals: number;
  fromAddress: Address;
  toAddress: Address;
  value: number;
  rawValue: string;
  hash: string;
  asset: string;
  chain: NetworkEnum;
  blockNum: string;
}

export interface SentWebhookReceipt {
  id: SentWebhookReceiptID;
  walletID: WalletID;
  triggeringWebhookID: WalletWebhookID;
  organizationID: OrganizationID;
  payload: WebhookPayload;
  timestamp: UnixTimestamp;
  response: string;
  statusCode: number;
  webhookURL: string;
}
