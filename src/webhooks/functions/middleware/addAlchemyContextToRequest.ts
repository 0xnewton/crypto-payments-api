import { AlchemyRequest } from "../../types";
import { logger } from "firebase-functions";
import { Request } from "firebase-functions/v2/https";

export const addAlchemyContextToRequest = (req: Request): void => {
  logger.debug("Adding Alchemy context to request");
  const buf = req.rawBody;
  const encoding = "utf8";
  const body = buf.toString(encoding || "utf8");
  const signature = req.headers["x-alchemy-signature"];
  (req as unknown as AlchemyRequest).alchemy = {
    rawBody: body,
    signature: signature as string,
  };
};
