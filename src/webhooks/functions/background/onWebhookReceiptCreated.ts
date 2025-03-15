import * as functions from "firebase-functions";
import { DBCollections } from "../../../lib/types";
import { WebhookReceipt } from "../../types";
import { getWalletByAddress } from "../../../wallets/db";
import * as webhooksService from "../../service";
import * as walletService from "../../../wallets/service";
import { gasWalletAddressAndPrivateKey } from "../../../lib/core";

export const onWebhookReceiptCreated = functions
  .runWith({
    secrets: [gasWalletAddressAndPrivateKey],
  })
  .firestore.document(
    `${DBCollections.WalletWebhooks}/{webhookID}/${DBCollections.WebhookReceipts}/{webhookReceiptID}`
  )
  .onCreate(async (snapshot, context) => {
    functions.logger.info("Webhook receipt created", { snapshot, context });
    const webhookReceipt = snapshot.data() as WebhookReceipt | undefined | null;
    if (!webhookReceipt) {
      return;
    }
    // Gets wallet from the toAddress of the webhook receipt
    const toAddress = webhookReceipt.toAddress;
    const chain = webhookReceipt.chain;
    const wallet = await getWalletByAddress({ address: toAddress });
    if (!wallet) {
      functions.logger.error("Wallet not found", { toAddress });
      return;
    }
    functions.logger.info("Wallet found", { wallet });
    if (wallet.chain.networkEnum !== chain) {
      functions.logger.error("Chain mismatch", { wallet, chain });
      return;
    }
    // Hit the webhook URL
    await Promise.allSettled([
      webhooksService.sendWebhook({ wallet, receipt: webhookReceipt }),
      walletService.transferFundsToDaoAndReceivingAddress({
        wallet,
        webhookReceipt,
      }),
    ]);
  });
