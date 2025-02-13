import { FieldValue, UpdateData } from "firebase-admin/firestore";
import { db, getWalletDoc, getWalletWebhookCollection } from "../lib/core";
import { NetworkEnum, WalletWebhookID } from "../lib/types";
import { WalletWebhook } from "./types";
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
