import { NextFunction } from "express";
import { Request, Response } from "express-serve-static-core";
import * as crypto from "crypto";
import { AlchemyRequest } from "../../types";
import { logger } from "firebase-functions";
import { getWebhookSigningKey } from "../../../lib/core/secretsService";

const isValidSignatureForAlchemyRequest = (
  request: AlchemyRequest,
  signingKey: string
): boolean => {
  return isValidSignatureForStringBody(
    request.alchemy.rawBody,
    request.alchemy.signature,
    signingKey
  );
};

const isValidSignatureForStringBody = (
  body: string,
  signature: string,
  signingKey: string
): boolean => {
  const hmac = crypto.createHmac("sha256", signingKey); // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, "utf8"); // Update the token hash with the request body using utf8
  const digest = hmac.digest("hex");
  return signature === digest;
};

export const validateAlchemySignature = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Validating Alchemy Signature");
    const webhookID = req.body.webhookId;
    if (!webhookID) {
      logger.error("No webhook ID found in request body, unauthorized!");
      throw new Error("No webhook ID found in request body, unauthorized!");
    }
    logger.info("Webhook ID found in request body", { webhookID });
    const signingKey = await getWebhookSigningKey(webhookID);
    if (!signingKey) {
      logger.error("No signing key found for webhook ID, unauthorized!");
      throw new Error("No signing key found for webhook ID, unauthorized!");
    }
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKey)) {
      const errMessage = "Signature validation failed, unauthorized!";
      logger.debug(errMessage);
      res.status(403).send(errMessage);
      throw new Error(errMessage);
    } else {
      logger.debug("Signature validation passed");
      next();
    }
  };
};
