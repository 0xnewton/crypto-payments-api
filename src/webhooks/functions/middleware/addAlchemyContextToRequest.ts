import { AlchemyRequest } from "../../types";
import { logger } from "firebase-functions";
import { NextFunction, Request, Response } from "express";

export const addAlchemyContextToRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logger.debug("Adding Alchemy context to request");
  const buf = (req as unknown as { rawBody?: Buffer }).rawBody;
  const encoding = "utf8";
  const body = buf ? buf.toString(encoding || "utf8") : "";
  const signature = req.headers["x-alchemy-signature"];
  (req as unknown as AlchemyRequest).alchemy = {
    rawBody: body,
    signature: signature as string,
  };
  next();
};
