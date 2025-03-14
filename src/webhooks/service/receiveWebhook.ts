import { logger } from "firebase-functions";
import { AlchemyWebhookEvent } from "../types";
import {
  createWebhookReceipts,
  getWebhookByAlchemyWebhookID,
  WebhookReceiptCreateParams,
} from "../db";
import { parseNetworkEnum } from "../../lib/constants";

export const receiveWebhook = async (event: AlchemyWebhookEvent) => {
  logger.info("Received webhook service", { event });
  const webhookID = event.webhookId;
  const webhook = await getWebhookByAlchemyWebhookID(webhookID);
  if (!webhook) {
    logger.info("Webhook not found", { webhookID });
    throw new Error("Webhook not found");
  }

  logger.info("Webhook found", { webhookID, id: webhook.id });
  const payloads = createWebhookReceiptPayloads(event);
  logger.info("Webhook receipt payloads", { payloads });
  if (payloads.length === 0) {
    logger.error("No payloads to create webhook receipts");
    throw new Error("No payloads to create webhook receipts");
  }

  const fullPayloads: WebhookReceiptCreateParams[] = payloads.map(
    (payload) => ({
      ...payload,
      webhookID: webhook.id,
      alchemyWebhookID: webhookID,
    })
  );

  await createWebhookReceipts(webhook.id, fullPayloads);

  return;
};

type CreateWebhookReceiptSnippet = Omit<
  WebhookReceiptCreateParams,
  "webhookID" | "alchemyWebhookID"
>;

const createWebhookReceiptPayloads = (
  event: AlchemyWebhookEvent
): CreateWebhookReceiptSnippet[] => {
  // Create a webhook receipt
  if (event.type !== "ADDRESS_ACTIVITY") {
    logger.error("Invalid event type", { type: event.type });
    return [];
  }

  const activity = event.event?.activity;
  const chain = event.event?.network;
  if (!Array.isArray(activity) || activity.length === 0) {
    logger.error("No activity found in webhook event", { event });
    return [];
  }
  const networkEnum = chain ? parseNetworkEnum(chain) : undefined;
  if (!networkEnum) {
    logger.error("No valid chain found in webhook event", { event });
    return [];
  }
  logger.info("network enum parsed", { networkEnum, chain });

  const payloads: CreateWebhookReceiptSnippet[] = [];
  for (const act of activity) {
    if (
      !act.asset ||
      typeof act.asset !== "string" ||
      !act.blockNum ||
      typeof act.blockNum !== "string" ||
      !act.category ||
      typeof act.category !== "string" ||
      !act.fromAddress ||
      typeof act.fromAddress !== "string" ||
      !act.toAddress ||
      typeof act.toAddress !== "string" ||
      !act.hash ||
      typeof act.hash !== "string" ||
      !act.value ||
      typeof act.value !== "number" ||
      !act.rawContract ||
      typeof act.rawContract !== "object" ||
      !act.rawContract.rawValue ||
      typeof act.rawContract.rawValue !== "string" ||
      !act.rawContract.address ||
      typeof act.rawContract.address !== "string" ||
      !act.rawContract.decimals ||
      typeof act.rawContract.decimals !== "number"
    ) {
      continue;
    }
    payloads.push({
      eventID: event.id,
      eventType: event.type,
      contractAddress: act.rawContract.address,
      contractDecimals: act.rawContract.decimals,
      fromAddress: act.fromAddress,
      toAddress: act.toAddress,
      rawValue: act.rawContract.rawValue,
      value: act.value,
      hash: act.hash,
      category: act.category,
      asset: act.asset,
      blockNum: act.blockNum,
      chain: networkEnum,
    });
  }
  return payloads;
};
