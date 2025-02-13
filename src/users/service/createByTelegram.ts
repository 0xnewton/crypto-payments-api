import { createUserWithOrganization, getUserByID } from "../db";
import { Role, User } from "../types";
import { TelegramUserID } from "../../lib/types";
import { logger } from "firebase-functions";
import { UserExistsError } from "../errors";
import { Context } from "telegraf";
import {
  createUser as createUserAuth,
  deleteUser,
  deleteUser as deleteUserAuth,
  getUserByID as getUserAuthByID,
  updateUserClaims,
} from "../auth";
import { generateUserIDFromTelegramID } from "../utils";
import { Organization } from "../../organizations/types";
import * as organizationService from "../../organizations/service";

interface CreateUserParams {
  telegramUserID: TelegramUserID;
  telegramUsername: string;
  telegramChatID: number;
}

export interface CreateUserResponse {
  user: User;
  organization: Organization;
}

export const createByTelegram = async (
  params: CreateUserParams,
  context: { tgContext?: Context }
): Promise<CreateUserResponse> => {
  logger.info("Create user service request hit", { params });
  // generate the id
  const userID = generateUserIDFromTelegramID(params.telegramUserID);

  const [existingUser, existingAuthUser] = await Promise.all([
    getUserByID(userID),
    getUserAuthByID(userID),
  ]);

  if (existingUser || existingAuthUser) {
    logger.debug("User already exists", {
      params,
      existingAuthUser,
      existingUser,
    });
    throw new UserExistsError("User already exists", userID);
  }

  if (context.tgContext) {
    context.tgContext.reply("Give me a moment while I set up your account...");
  }

  // First create the user auth record

  await createUserAuth({
    payload: {
      uid: userID,
    },
  });

  let organization: Organization;
  let user: User;
  try {
    ({ organization, user } = await createUserWithOrganization({
      id: userID,
      telegramUserID: params.telegramUserID,
      telegramUsername: params.telegramUsername,
      telegramChatID: params.telegramChatID,
      email: null,
      name: params.telegramUsername,
      organizationPayload: {
        name: params.telegramUsername
          ? `${params.telegramUsername}'s Organization`
          : "Epic Organization",
      },
    }));
  } catch (err: any) {
    logger.error("Error creating user auth record", {
      errorDetails: err?.message,
    });
    // Clean up the user auth record
    await deleteUserAuth(userID);
    throw err;
  }

  logger.info("Created user and organization", { user, organization });

  // Add user custom claims for the organization
  try {
    await updateUserClaims(userID, {
      roles: [
        {
          role: Role.Admin,
          userID,
          organizationID: organization.id,
        },
      ],
    });
  } catch (err: any) {
    logger.error("Error updating user claims", {
      errorDetails: err?.message,
      user,
    });
    await Promise.all([
      deleteUser(userID),
      deleteUserAuth(userID),
      organizationService.deleteOrganization({ id: organization.id }),
    ]);
    throw err;
  }

  return {
    user,
    organization,
  };
};
