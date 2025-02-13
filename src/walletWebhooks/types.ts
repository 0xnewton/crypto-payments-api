import { NetworkEnum, UnixTimestamp, WalletWebhookID } from "../lib/types";

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
