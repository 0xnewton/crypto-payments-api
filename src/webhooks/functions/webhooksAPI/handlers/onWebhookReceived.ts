import { logger } from "firebase-functions";
import { Request, Response } from "express";
import { AlchemyWebhookEvent } from "../../../types";
import * as webhooksService from "../../../service";

export const onWebhookReceived = async (req: Request, res: Response) => {
  const webhookEvent = req.body as AlchemyWebhookEvent;
  const webhookID = webhookEvent.webhookId;

  logger.info("On Webhook Received", { webhookEvent, webhookID });
  try {
    await webhooksService.receiveWebhook(webhookEvent);
  } catch (err: any) {
    logger.error("Error receiving webhook", { error: err });
    // Silent fail for now to not re-run the webhook
  }

  res.status(200).send("OK");
  return;
};
