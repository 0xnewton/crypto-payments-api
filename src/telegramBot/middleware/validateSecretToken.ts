import { logger } from "firebase-functions";
import { tgWebhookSecretToken } from "../../lib/core";
import { Request, Response, NextFunction } from "express";
import { APIError } from "../../externalAPI/errors";

export const validateSecretToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secretInHeader = req.headers["x-telegram-bot-api-secret-token"];
  const expectedSecret = tgWebhookSecretToken.value();
  if (!expectedSecret) {
    logger.error("Expected secret token is not set");
    throw new APIError(500, { message: "Unauthorized" });
  }
  if (secretInHeader !== expectedSecret) {
    logger.error("Invalid secret token");
    throw new APIError(500, { message: "Unauthorized" });
  }

  next();
};
