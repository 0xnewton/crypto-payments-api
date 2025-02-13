import { logger } from "firebase-functions";
import { getWalletDoc } from "../../lib/core";
import { Wallet } from "../types";
import * as webhookService from "../../walletWebhooks/service";

/**
 * Hard deletes wallet & detach from webhook
 * @param wallet
 * @returns
 */
export const deleteWallet = async (wallet: Wallet): Promise<void> => {
  logger.info("Delete Wallet Service", { wallet });
  if (wallet.deletedAt) {
    logger.info("Wallet already deleted", { wallet });
    return;
  }

  if (wallet.webhookID) {
    // Urgh we need to clean up the wallet from the webhook
    await webhookService.detachWallet({ wallet });
  }

  // Hard delete the wallet
  try {
    await getWalletDoc(wallet.organizationID, wallet.id).delete();
  } catch (err) {
    await webhookService.upsertWebhookAndAttachWallet({
      network: wallet.chain.networkEnum,
      walletAddress: wallet.address,
      wallet,
    });
    logger.error("Error deleting wallet", { wallet, error: err });
    throw err;
  }
};
