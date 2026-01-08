import { logger } from "firebase-functions";
import { tgWebhookSecretToken } from "../../lib/core";
import { Request, Response, NextFunction } from "express";

export const validateSecretToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secretInHeader = req.headers["x-telegram-bot-api-secret-token"];
  const expectedSecret = tgWebhookSecretToken.value();
  if (!expectedSecret) {
    logger.error("Expected secret token is not set");
    res.status(500).send("Unauthorized");
    return;
  }
  if (secretInHeader !== expectedSecret) {
    logger.error("Invalid secret token");
    res.status(401).send("Unauthorized");
    return;
  }

  next();
};
