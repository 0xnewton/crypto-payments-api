import { logger } from "firebase-functions";
import { APIResponseErrorPayload } from "../types";
import { Request, Response } from "express";
import { APIError } from "../errors";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response
): void => {
  logger.info("Error Handler ", { error: err });

  if (err instanceof APIError) {
    res.status(err.code).json(err.payload);
    return;
  }

  // Generic fallback error response
  const genericResponse: APIResponseErrorPayload = {
    success: false,
    message: "Internal Server Error",
  };
  res.status(500).json(genericResponse);
  return;
};
