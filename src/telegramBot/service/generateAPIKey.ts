import { logger } from "firebase-functions/v1";
import { BotContext, UserWithClaims } from "../types";
import { FetchResult } from "../../lib/types";
import { UserRole } from "../../users/types";
import {
  getUserFromContext,
  getUserOrganization,
  SOMETHING_WENT_WRONG_MESSAGE,
  UNREGISTERED_USER_MESSAGE,
} from "../utils";
import { TGUserNotFoundError } from "../../users/errors";
import { Organization } from "../../organizations/types";
import { isEditableRole } from "../../users/utils";
import * as apiKeyService from "../../apiKeys/service";
import { APIKey } from "../../apiKeys/types";

export const generateAPIKey = async (ctx: BotContext) => {
  ctx.reply("Ok, generating a new API key... Please wait.");
  logger.info("API key generation command received");

  let userDetails: UserWithClaims;
  try {
    userDetails = await getUserFromContext(ctx);
  } catch (err: any) {
    if (err instanceof TGUserNotFoundError) {
      ctx.reply(UNREGISTERED_USER_MESSAGE);
      return;
    }
    logger.error("Error fetching user", {
      errMessag: err?.message,
      code: err?.code,
    });
    ctx.reply(SOMETHING_WENT_WRONG_MESSAGE);
    return;
  }

  // Gets organization
  let organization: Organization;
  let role: UserRole;
  // default to
  try {
    ({
      organization: { data: organization },
      role,
    } = await getUserOrganization(userDetails));
  } catch (err: any) {
    logger.error("Error fetching organization", {
      errMessage: err?.message,
      code: err?.code,
    });
    ctx.reply(SOMETHING_WENT_WRONG_MESSAGE);
    return;
  }

  if (!isEditableRole(role)) {
    ctx.reply("You do not have permission to generate an API key.");
    return;
  }

  let key: FetchResult<APIKey>;
  let secretValue: string;
  try {
    // Generate the API key
    ({ key, secretValue } = await apiKeyService.create({
      userID: userDetails.user.data.id,
      organizationID: organization.id,
    }));
  } catch (err: any) {
    logger.error("Error generating API key", {
      errMessage: err?.message,
      code: err?.code,
      err,
    });
    ctx.reply(err?.message || SOMETHING_WENT_WRONG_MESSAGE);
    return;
  }

  ctx.reply(
    `API Key generated successfully!\n\nKey: ${key.data.id}\nSecret: ${secretValue}. Please store it securely. We will never show it to you again.`
  );

  logger.info("API key generated", {
    key: key.data.id,
    userID: userDetails.user.data.id,
    organizationID: organization.id,
  });

  return;
};
