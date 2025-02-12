import { logger } from "firebase-functions";
import {
  APIRequest,
  APIResponse,
  APINextFunction,
  APIResponseErrorPayload,
} from "../types";
import * as apiKeyService from "../../apiKeys/service";
import { APIError } from "../errors";

export const validateAPIKey = async (
  req: APIRequest,
  res: APIResponse,
  next: APINextFunction
) => {
  logger.info("Validating API Key");
  const apiKey = req.headers["x-api-key"];

  if (typeof apiKey !== "string") {
    logger.info("API key is not a string in request", { type: typeof apiKey });
    throw new APIError(401, UNAUTHORIZED_RESPONSE_PAYLOAD);
  }

  try {
    const { organization } = await apiKeyService.validate(apiKey);
    req.organization = organization.data;
  } catch (err) {
    logger.debug("Error validating API key", { error: err });
    throw new APIError(401, UNAUTHORIZED_RESPONSE_PAYLOAD);
  }

  next();
};

const UNAUTHORIZED_RESPONSE_PAYLOAD: APIResponseErrorPayload = {
  success: false,
  message: "Unauthorized",
};
