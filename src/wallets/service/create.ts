import { logger } from "firebase-functions";
import { generateWalletKeyPair } from "../../lib/core";
import {
  encryptWalletPrivateKey,
  encryptWebhookSecret,
} from "../../lib/core/encryt";
import {
  Address,
  ChainSnippet,
  FetchResult,
  NetworkEnum,
  OrganizationID,
} from "../../lib/types";
import { Wallet, WalletSource } from "../types";
import {
  createWallet,
  getWalletByAddress,
  getWalletCountByOrganizationID,
} from "../db";
import * as organizationService from "../../organizations/service";
import { SUPPORTED_CHAINS } from "../../lib/constants";
import { Organization } from "../../organizations/types";
import { User } from "../../users/types";

interface CreateWalletParams {
  organizationID: OrganizationID;
  payload: {
    webhookURL: string;
    webhookSecret?: string;
    networkEnum: NetworkEnum;
    recipientAddress: Address;
    source: WalletSource;
  };
  cache: {
    organization?: FetchResult<Organization>;
    user?: FetchResult<User>;
  };
}

export const create = async (
  params: CreateWalletParams
): Promise<FetchResult<Wallet>> => {
  const walletKeyPair = generateWalletKeyPair();

  // Encrypt the private key
  const [
    existingWallet,
    organization,
    organizationConfig,
    encryptedPrivateKey,
    encryptedSecret,
    walletCount,
  ] = await Promise.all([
    getWalletByAddress({
      address: walletKeyPair.publicKey,
    }),
    params.cache.organization ||
      organizationService.getByID(params.organizationID),
    organizationService.getConfig(params.organizationID),
    encryptWalletPrivateKey(walletKeyPair.privateKey),
    params.payload.webhookSecret
      ? encryptWebhookSecret(params.payload.webhookSecret)
      : null,
    getWalletCountByOrganizationID(params.organizationID),
  ]);

  if (!organization) {
    logger.error("Organization not found", {
      organizationID: params.organizationID,
    });
    throw new Error("Organization not found");
  }

  if (!organizationConfig) {
    logger.error("Organization config not found", {
      organizationID: params.organizationID,
    });
    throw new Error("Organization config not found");
  }

  if (existingWallet) {
    // WUT this should never happen
    // TODO maybe in the future allow multiple of the same evm wallet
    logger.error("Wallet already exists", { address: walletKeyPair.publicKey });
    throw new Error("Wallet already exists");
  }

  if (walletCount >= organizationConfig.data.maxWalletsAllowed) {
    logger.error("Max wallets allowed reached", {
      organizationID: params.organizationID,
      maxWalletsAllowed: organizationConfig.data.maxWalletsAllowed,
    });
    throw new Error(
      "You've reached the maximum number of wallets allowed. Upgrade for more."
    );
  }

  // Save the wallet to the database
  const chain = SUPPORTED_CHAINS.find(
    (c) => c.networkEnum === params.payload.networkEnum
  );
  if (!chain) {
    logger.error("Unsupported chain", {
      networkEnum: params.payload.networkEnum,
      organizationID: params.organizationID,
      address: walletKeyPair.publicKey,
    });
    throw new Error("Unsupported chain");
  }
  const chainSnippet: ChainSnippet = {
    evmChainId: chain.evmChainId,
    networkEnum: chain.networkEnum,
    name: chain.name,
  };

  const wallet = await createWallet({
    payload: {
      organizationID: params.organizationID,
      name: "Main Wallet",
      address: walletKeyPair.publicKey,
      encryptedPrivateKey,
      webhookURL: params.payload.webhookURL,
      encryptedWebhookSecret: encryptedSecret,
      daoFeeBasisPoints: organizationConfig.data.defaultDaoFeeBasisPoints,
      daoFeeRecipient: chain.daoFeeWallet.value() as Address,
      recipientAddress: params.payload.recipientAddress,
      chain: chainSnippet,
      source: params.payload.source,
      createdBy: params.cache.user?.data.id || null,
    },
  });

  // Setup the alchemy webhook (could also be moved to background onCreate function)

  return wallet;
};
