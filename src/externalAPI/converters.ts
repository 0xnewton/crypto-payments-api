import { Wallet } from "../wallets/types";
import { WalletV1 } from "./types";

export const walletV1 = (wallet: Wallet): WalletV1 => {
  return {
    id: wallet.id,
    organizationID: wallet.organizationID,
    name: wallet.name,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
    deletedAt: wallet.deletedAt,
    address: wallet.address,
    webhookURL: wallet.webhookURL,
    daoFeeBasisPoints: wallet.daoFeeBasisPoints,
    recipientAddress: wallet.recipientAddress,
    metadata: wallet.apiMetadata,
  };
};
