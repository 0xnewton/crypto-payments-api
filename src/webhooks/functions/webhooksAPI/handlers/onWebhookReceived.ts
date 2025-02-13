import { logger } from "firebase-functions";
import { Request, Response } from "express";

export const onWebhookReceived = async (req: Request, res: Response) => {
  logger.info("On Webhook Received", { body: req.body });
  return;
};
