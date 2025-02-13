import { logger } from "firebase-functions";
import { Request, Response } from "express";

export const receiveWebhook = async (req: Request, res: Response) => {
  logger.info("Received webhook", { body: req.body });
  return;
};
