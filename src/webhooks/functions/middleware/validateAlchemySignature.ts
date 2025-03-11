import { NextFunction } from "express";
import { Request, Response } from "express-serve-static-core";
import * as crypto from "crypto";
import { AlchemyRequest } from "../../types";
import { alchemySigningToken } from "../../../lib/core";
import { logger } from "firebase-functions";

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
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info("Validating Alchemy Signature");
    const signingKey = alchemySigningToken.value();
    if (!isValidSignatureForAlchemyRequest(req as AlchemyRequest, signingKey)) {
      logger.debug("Signature validation failed, unauthorized!");
      const errMessage = "Signature validation failed, unauthorized!";
      res.status(403).send(errMessage);
      throw new Error(errMessage);
    } else {
      logger.debug("Signature validation passed");
      next();
    }
  };
};
