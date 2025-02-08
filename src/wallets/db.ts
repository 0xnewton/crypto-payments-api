import { logger } from "firebase-functions";
import {
  Address,
  ChainSnippet,
  EncryptedPrivateKey,
  FetchResult,
  OrganizationID,
  UserID,
  WalletID,
} from "../lib/types";
import { Wallet, WalletSource } from "./types";
import {
  getNewWalletRef,
  getWalletCollection,
  getWalletCollectionGroup,
} from "../lib/core";

interface CreateWalletParams {
  payload: {
    organizationID: OrganizationID;
    name: string;
    address: Address;
    encryptedPrivateKey: EncryptedPrivateKey;
    webhookURL: string;
    encryptedWebhookSecret: string | null;
    daoFeeBasisPoints: number;
    daoFeeRecipient: Address;
    recipientAddress: Address;
    chain: ChainSnippet;
    source: WalletSource;
    createdBy: UserID | null;
  };
}

export const createWallet = async (
  params: CreateWalletParams
): Promise<FetchResult<Wallet>> => {
  logger.info("Creating wallet", { params });
  const nowTimestamp = Date.now();
  const walletRef = getNewWalletRef(params.payload.organizationID);
  const walletPayload: Wallet = {
    id: walletRef.id as WalletID,
    organizationID: params.payload.organizationID,
    name: params.payload.name,
    address: params.payload.address,
    encryptedPrivateKey: params.payload.encryptedPrivateKey,
    webhookURL: params.payload.webhookURL,
    encryptedWebhookSecret: params.payload.encryptedWebhookSecret,
    daoFeeBasisPoints: params.payload.daoFeeBasisPoints,
    daoFeeRecipient: params.payload.daoFeeRecipient,
    recipientAddress: params.payload.recipientAddress,
    chain: params.payload.chain,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp,
    deletedAt: null,
    source: params.payload.source,
    createdBy: params.payload.createdBy,
  };
  await walletRef.set(walletPayload);
  return { data: walletPayload, ref: walletRef };
};

export const getWalletByField = async (
  field: "address" & keyof Wallet,
  value: Wallet["address"]
): Promise<FetchResult<Wallet> | null> => {
  logger.info("Fetching wallet by id", { field, value });
  const refsnapshot = await getWalletCollectionGroup()
    .where(field, "==", value)
    .get();
  const docs = refsnapshot.docs.map((doc) => {
    return { data: doc.data(), ref: doc.ref };
  });

  return docs[0] || null;
};

interface GetWalletParams {
  address: Address;
}
export const getWalletByAddress = async (
  params: GetWalletParams
): Promise<FetchResult<Wallet> | null> => {
  logger.info("Fetching wallet by address", { params });
  return getWalletByField("address", params.address);
};

export const getWalletCountByOrganizationID = async (
  organizationID: OrganizationID
): Promise<number> => {
  logger.info("Fetching wallet count by organization id", { organizationID });
  const deletedAtKey: keyof Wallet = "deletedAt";
  const refsnapshot = await getWalletCollection(organizationID)
    .where(deletedAtKey, "==", null)
    .get();
  return refsnapshot.size;
};
