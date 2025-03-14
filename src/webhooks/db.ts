import { FieldValue, UpdateData } from "firebase-admin/firestore";
import {
  db,
  getWalletDoc,
  getWalletWebhookCollection,
  getWebhookReceiptCollection,
} from "../lib/core";
import {
  Address,
  NetworkEnum,
  WalletWebhookID,
  WebhookReceiptID,
} from "../lib/types";
import { AlchemyWebhookType, WalletWebhook, WebhookReceipt } from "./types";
import { Wallet } from "../wallets/types";
import { logger } from "firebase-functions";

export const getMostRecentWebhook = async (
  chain: NetworkEnum
): Promise<WalletWebhook | null> => {
  const collection = getWalletWebhookCollection();
  const refsnapshot = await collection.get();
  if (refsnapshot.empty || refsnapshot.docs.length === 0) {
    return null;
  }
  const docs = refsnapshot.docs
    .map((doc) => doc.data())
    .filter((e) => e.network === chain);
  // Newest webhook first
  docs.sort((a, b) => b.createdAt - a.createdAt);
  return docs[0] || null;
};

interface CreateWebhookDBParams {
  alchemyWebhookID: string;
  network: NetworkEnum;
  webhookURL: string;
  wallets: Wallet[];
}
/** Transaction to create the webhook document and attach it to the webhook  */
export const createWebhookDBAndAttachToWallet = async (
  params: CreateWebhookDBParams
) => {
  logger.info("Creating webhook in web3 provider", {
    chain: params.network,
    addresses: params.wallets.map((wallet) => wallet.address),
  });
  const collection = getWalletWebhookCollection();
  const webhookRef = collection.doc();
  const walletRefs = params.wallets.map((wallet) =>
    getWalletDoc(wallet.organizationID, wallet.id)
  );
  const webhookID = webhookRef.id as WalletWebhookID;
  const webhookPayload: WalletWebhook = {
    id: webhookID,
    alchemyWebhookID: params.alchemyWebhookID,
    webhookURL: params.webhookURL,
    network: params.network,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    walletCount: params.wallets.length,
  };
  const walletUpdateRequest: UpdateData<Wallet> = {
    webhookID: webhookID,
  };
  logger.info("Creating webhook in DB", {
    webhookPayload,
    walletUpdateRequest,
  });
  const results = await db.runTransaction(async (transaction) => {
    transaction.create(webhookRef, webhookPayload);
    walletRefs.forEach((ref) => transaction.update(ref, walletUpdateRequest));

    return { webhook: webhookPayload };
  });

  return { webhook: results.webhook };
};

export const incrementWebhookWalletCountAndUpdateWallet = async (
  webhookID: WalletWebhookID,
  wallets: Wallet[]
) => {
  logger.info("Incrementing webhook wallet count and updating wallet", {
    webhookID,
    walletCount: wallets.length,
    walletAddresses: wallets.map((wallet) => wallet.address),
  });
  const collection = getWalletWebhookCollection();
  const webhook = collection.doc(webhookID);
  const walletRefs = wallets.map((wallet) =>
    getWalletDoc(wallet.organizationID, wallet.id)
  );

  const webhookUpdateRequest: UpdateData<WalletWebhook> = {
    walletCount: FieldValue.increment(wallets.length),
  };
  const walletUpdateRequest: UpdateData<Wallet> = {
    webhookID: webhookID,
  };

  logger.info("Update requests", {
    webhookUpdateRequest,
    walletUpdateRequest,
  });
  await db.runTransaction(async (transaction) => {
    transaction.update(webhook, webhookUpdateRequest);
    walletRefs.forEach((ref) => transaction.update(ref, walletUpdateRequest));
  });
};

export const decrementWebhookWalletCountAndUpdateWallet = async (
  webhookID: WalletWebhookID,
  wallets: Wallet[]
) => {
  logger.info("Decrementing webhook wallet count and updating wallet", {
    webhookID,
    walletCount: wallets.length,
    walletAddresses: wallets.map((wallet) => wallet.address),
  });
  const collection = getWalletWebhookCollection();
  const webhook = collection.doc(webhookID);
  const walletRefs = wallets.map((wallet) =>
    getWalletDoc(wallet.organizationID, wallet.id)
  );

  const decrementBy = -1 * wallets.length;
  const webhookUpdateRequest: UpdateData<WalletWebhook> = {
    walletCount: FieldValue.increment(decrementBy),
  };
  const walletUpdateRequest: UpdateData<Wallet> = {
    webhookID: null,
  };
  logger.info("Update requests", {
    webhookUpdateRequest,
    walletUpdateRequest,
  });
  await db.runTransaction(async (transaction) => {
    transaction.update(webhook, webhookUpdateRequest);
    walletRefs.forEach((ref) => transaction.update(ref, walletUpdateRequest));
  });
};

export const getWebhookByAlchemyWebhookID = async (
  webhookID: string
): Promise<WalletWebhook | null> => {
  const collection = getWalletWebhookCollection();
  const key: keyof WalletWebhook = "alchemyWebhookID";
  const ref = collection.where(key, "==", webhookID);
  const snapshot = await ref.get();
  if (snapshot.empty || snapshot.docs.length === 0) {
    return null;
  }
  const docs = snapshot.docs.map((doc) => doc.data());
  return docs[0];
};

export interface WebhookReceiptCreateParams {
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
export const createWebhookReceipts = async (
  webhookID: WalletWebhookID,
  receipts: WebhookReceiptCreateParams[]
) => {
  await db.runTransaction(async (transaction) => {
    const collection = getWebhookReceiptCollection(webhookID);
    receipts.forEach((receipt) => {
      const ref = collection.doc();
      const payload: WebhookReceipt = {
        id: ref.id as WebhookReceiptID,
        createdAt: Date.now(),
        webhookID: receipt.webhookID,
        alchemyWebhookID: receipt.alchemyWebhookID,
        eventID: receipt.eventID,
        eventType: receipt.eventType,
        contractAddress: receipt.contractAddress,
        contractDecimals: receipt.contractDecimals,
        fromAddress: receipt.fromAddress,
        toAddress: receipt.toAddress,
        rawValue: receipt.rawValue,
        value: receipt.value,
        hash: receipt.hash,
        category: receipt.category,
        asset: receipt.asset,
        blockNum: receipt.blockNum,
        chain: receipt.chain,
      };
      transaction.create(ref, payload);
    });
  });
};
