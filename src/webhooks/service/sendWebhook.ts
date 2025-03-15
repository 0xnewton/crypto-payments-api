import { logger } from "firebase-functions";
import { Wallet } from "../../wallets/types";
import { decryptWebhookSecret } from "../../lib/core/encryt";
import { WEBHOOK_SECRET_HEADER } from "../constants";
import { SentWebhookReceipt, WebhookPayload, WebhookReceipt } from "../types";
import { getSentWebhookReceiptCollection } from "../../lib/core";
import { SentWebhookReceiptID } from "../../lib/types";

interface SendWebhookParams {
  wallet: Wallet;
  receipt: WebhookReceipt;
}

export const sendWebhook = async (params: SendWebhookParams) => {
  logger.info("Sending wallet webhook", { wallet: params.wallet });
  // If there is a secret, decrypt it
  let webhookSecret: string | null = null;
  if (params.wallet.encryptedWebhookSecret) {
    // Decrypt the webhook secret
    webhookSecret = await decryptWebhookSecret(
      params.wallet.encryptedWebhookSecret
    );
  }

  // Hit the webhook
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (webhookSecret) {
    headers[WEBHOOK_SECRET_HEADER] = webhookSecret;
  }
  const payload: WebhookPayload = {
    receivingAddress: params.wallet.recipientAddress,
    eventID: params.receipt.eventID,
    contractAddress: params.receipt.contractAddress,
    contractDecimals: params.receipt.contractDecimals,
    fromAddress: params.receipt.fromAddress,
    toAddress: params.receipt.toAddress,
    value: params.receipt.value,
    rawValue: params.receipt.rawValue,
    hash: params.receipt.hash,
    asset: params.receipt.asset,
    chain: params.receipt.chain,
    blockNum: params.receipt.blockNum,
  };
  let response: Response | null = null;
  try {
    logger.info("Sending webhook", { payload });
    response = await fetch(params.wallet.webhookURL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error("Error sending webhook", { err });
  }

  const sentWebhookReceiptRef = getSentWebhookReceiptCollection(
    params.wallet.organizationID,
    params.wallet.id
  ).doc();
  const body: SentWebhookReceipt = {
    id: sentWebhookReceiptRef.id as SentWebhookReceiptID,
    walletID: params.wallet.id,
    triggeringWebhookID: params.receipt.webhookID,
    organizationID: params.wallet.organizationID,
    payload,
    timestamp: Date.now(),
    response: response ? response.toString() : "",
    statusCode: response ? response.status : 0,
    webhookURL: params.wallet.webhookURL,
  };

  await sentWebhookReceiptRef.set(body);

  return body;
};
