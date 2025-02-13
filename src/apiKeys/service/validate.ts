import { logger } from "firebase-functions";
import { hashWithHMAC } from "../../lib/core";
import { getAPIKeyByHash } from "../db";
import * as organizationService from "../../organizations/service";
import { APIKey } from "../types";
import { Organization } from "../../organizations/types";

interface ValidateResponse {
  organization: Organization;
  key: APIKey;
}
export const validate = async (apiKey: string): Promise<ValidateResponse> => {
  logger.info("Validating API key", {
    isEmpty: !apiKey || apiKey.length === 0,
  });

  // Hash it
  const hash = hashWithHMAC(apiKey);

  // Look up in the database
  const key = await getAPIKeyByHash({ hash });

  if (!key) {
    logger.info("API key not found", { hash });
    throw new Error("Unauthorized");
  }

  if (key.revokedAt) {
    logger.info("API key is revoked", { id: key.id });
    throw new Error("Unauthorized");
  }

  logger.info("API key found", {
    id: key.id,
    userID: key.createdAt,
    organizationID: key.organizationID,
  });

  // Fetch the user
  const organization = await organizationService.getByID(key.organizationID);

  if (!organization) {
    logger.error("User not found", { id: key.createdBy });
    throw new Error("Unauthorized");
  }

  return { organization, key };
};
