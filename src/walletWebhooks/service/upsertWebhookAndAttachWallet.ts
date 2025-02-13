import { logger } from "firebase-functions";
import { walletWebhookURL } from "../../lib/core/config";
import { Address, NetworkEnum } from "../../lib/types";
import { MAX_ALCHEMY_WALLETS_PER_WEBHOOK } from "../constants";
import {
  createWebhookDBAndAttachToWallet,
  getMostRecentWebhook,
  incrementWebhookWalletCountAndUpdateWallet,
} from "../db";
import { WalletWebhook } from "../types";
import {
  addOrRemoveAddresses as providerAddOrRemoveAddresses,
  createWalletWebhook as providerCreateWebhook,
  deleteWalletWebhook as providerDeleteWebhook,
} from "../web3Provider";
import { getWalletByAddress } from "../../wallets/db";
import { Wallet } from "../../wallets/types";

interface UpsertWebhookAndAttachToWalletPayload {
  network: NetworkEnum;
  walletAddress: Address;
  wallet?: Wallet;
}

export const upsertWebhookAndAttachWallet = async (
  payload: UpsertWebhookAndAttachToWalletPayload
): Promise<WalletWebhook> => {
  logger.info("Upsert Webhook and Attach Wallet", { payload });
  const webhookURL = walletWebhookURL.value();
  if (!webhookURL) {
    logger.error("No internal webhook URL configured");
    throw new Error("No webhook URL provided");
  }
  const [webhookDB, wallet] = await Promise.all([
    getMostRecentWebhook(payload.network),
    payload.wallet || getWalletByAddress({ address: payload.walletAddress }),
  ]);

  if (!wallet) {
    logger.error("Wallet not found", { address: payload.walletAddress });
    throw new Error("Wallet not found");
  }

  if (wallet.webhookID) {
    logger.error("Wallet already has a webhook", {
      address: payload.walletAddress,
    });

    throw new Error("Wallet already has a webhook");
  }

  const shouldCreateWebhook =
    !webhookDB || webhookDB.walletCount >= MAX_ALCHEMY_WALLETS_PER_WEBHOOK;

  const walletArraysToAdd = [wallet];

  if (shouldCreateWebhook) {
    const webhookProvider = await providerCreateWebhook({
      payload: {
        webhookURL,
        chain: payload.network,
        addresses: [payload.walletAddress],
      },
    });

    try {
      const { webhook } = await createWebhookDBAndAttachToWallet({
        alchemyWebhookID: webhookProvider.id,
        network: payload.network,
        webhookURL: webhookURL,
        wallets: walletArraysToAdd,
      });

      return webhook;
    } catch (err: any) {
      logger.error("Error creating webhook in DB", {
        error: err?.message,
      });
      await providerDeleteWebhook(webhookProvider.id);
      throw err;
    }
  } else {
    // We need to add the address to the webhook
    await providerAddOrRemoveAddresses(
      webhookDB.alchemyWebhookID,
      walletArraysToAdd.map((w) => w.address),
      []
    );
    try {
      // Increment the wallet count in DB
      await incrementWebhookWalletCountAndUpdateWallet(
        webhookDB.id,
        walletArraysToAdd
      );
    } catch (err: any) {
      logger.error("Error incrementing wallet count in DB", {
        error: err?.message,
      });
      const removeWalletAddresses = walletArraysToAdd.map((w) => w.address);
      await providerAddOrRemoveAddresses(
        webhookDB.alchemyWebhookID,
        [],
        removeWalletAddresses
      );
      throw err;
    }
    return webhookDB;
  }
};
