import { logger } from "firebase-functions";
import {
  Address,
  ChainSnippet,
  EncryptedPrivateKey,
  OrganizationID,
  UserID,
  WalletID,
} from "../lib/types";
import { Wallet, WalletAPIMetadata, WalletSource } from "./types";
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
    apiMetadata: WalletAPIMetadata | null;
  };
}

export const createWallet = async (
  params: CreateWalletParams
): Promise<Wallet> => {
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
    apiMetadata: params.payload.apiMetadata,
    webhookID: null,
  };
  await walletRef.set(walletPayload);
  return walletPayload;
};

const getWalletByField = async (
  field: ("address" | "id") & keyof Wallet, // If you add one, you should add it to firestore.indexes.json
  value: Wallet["address"] | Wallet["id"]
): Promise<Wallet | null> => {
  logger.info("Fetching wallet by id", { field, value });
  const refsnapshot = await getWalletCollectionGroup()
    .where(field, "==", value)
    .get();
  const docs = refsnapshot.docs.map((doc) => doc.data());

  return docs[0] || null;
};

interface GetWalletParams {
  address: Address;
}
export const getWalletByAddress = async (
  params: GetWalletParams
): Promise<Wallet | null> => {
  logger.info("Fetching wallet by address", { params });
  return getWalletByField("address", params.address);
};

interface GetWalletByIDParams {
  id: WalletID;
}
export const getWalletByID = async (
  params: GetWalletByIDParams
): Promise<Wallet | null> => {
  logger.info("Fetching wallet by address", { params });
  return getWalletByField("id", params.id);
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
