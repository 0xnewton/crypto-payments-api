import { FieldValue, UpdateData } from "firebase-admin/firestore";
import { db, getWalletDoc, getWalletWebhookCollection } from "../lib/core";
import { NetworkEnum, WalletWebhookID } from "../lib/types";
import { WalletWebhook } from "./types";
import { Wallet } from "../wallets/types";

export const getMostRecentWebhook = async (
  chain: NetworkEnum
): Promise<WalletWebhook | null> => {
  const collection = getWalletWebhookCollection();
  const refsnapshot = await collection.get();
  if (refsnapshot.empty || refsnapshot.docs.length === 0) {
    return null;
  }
  const docs = refsnapshot.docs
    .map((doc) => {
      return { data: doc.data(), ref: doc.ref };
    })
    .filter((e) => e.data.network === chain);
  // Newest webhook first
  docs.sort((a, b) => b.data.createdAt - a.data.createdAt);
  return docs[0]?.data || null;
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
  const results = await db.runTransaction(async (transaction) => {
    const collection = getWalletWebhookCollection();
    const webhookRef = collection.doc();
    const walletRefs = params.wallets.map((wallet) =>
      getWalletDoc(wallet.organizationID, wallet.id)
    );
    const webhookID = webhookRef.id as WalletWebhookID;
    const payload: WalletWebhook = {
      id: webhookID,
      alchemyWebhookID: params.alchemyWebhookID,
      webhookURL: params.webhookURL,
      network: params.network,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
      walletCount: params.wallets.length,
    };
    const updateRequest: UpdateData<Wallet> = {
      webhookID: webhookID,
    };

    transaction.create(webhookRef, payload);
    walletRefs.forEach((ref) => transaction.update(ref, updateRequest));

    return { data: payload, ref: webhookRef };
  });

  return { data: results.data, ref: results.ref };
};

export const incrementWebhookWalletCountAndUpdateWallet = async (
  webhookID: WalletWebhookID,
  wallets: Wallet[]
) => {
  await db.runTransaction(async (transaction) => {
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
    transaction.update(webhook, webhookUpdateRequest);
    walletRefs.forEach((ref) => transaction.update(ref, walletUpdateRequest));
  });
};

export const decrementWebhookWalletCountAndUpdateWallet = async (
  webhookID: WalletWebhookID,
  wallets: Wallet[]
) => {
  await db.runTransaction(async (transaction) => {
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
    transaction.update(webhook, webhookUpdateRequest);
    walletRefs.forEach((ref) => transaction.update(ref, walletUpdateRequest));
  });
};
