import { logger } from "firebase-functions";
import { Wallet } from "../../wallets/types";
import { addOrRemoveAddresses } from "../web3Provider";
import { decrementWebhookWalletCountAndUpdateWallet } from "../db";

interface DetachWalletPayload {
  wallet: Wallet;
}

export const detachWallet = async (payload: DetachWalletPayload) => {
  logger.info("Detaching wallet from webhook", { wallet: payload.wallet });
  if (!payload.wallet.webhookID) {
    logger.debug("Wallet does not have a webhook", { wallet: payload.wallet });
    throw new Error("Wallet does not have a webhook");
  }

  await addOrRemoveAddresses(
    payload.wallet.webhookID,
    payload.wallet.chain.networkEnum,
    [],
    [payload.wallet.address]
  );

  try {
    await decrementWebhookWalletCountAndUpdateWallet(payload.wallet.webhookID, [
      payload.wallet,
    ]);
  } catch (err) {
    logger.error("Error decrementing webhook wallet count", {
      wallet: payload.wallet,
      error: err,
    });
    // Add the wallet back to the webhook
    await addOrRemoveAddresses(
      payload.wallet.webhookID,
      payload.wallet.chain.networkEnum,
      [payload.wallet.address],
      []
    );
    throw err;
  }
};
