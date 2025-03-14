import { logger } from "firebase-functions";
import { Request, Response } from "express";
import { AlchemyWebhookEvent } from "../../../types";

export const onWebhookReceived = async (req: Request, res: Response) => {
  const webhookEvent = req.body as AlchemyWebhookEvent;
  const webhookID = webhookEvent.webhookId;

  logger.info("On Webhook Received", { webhookEvent, webhookID });

  res.status(200).send("OK");
  return;
};
