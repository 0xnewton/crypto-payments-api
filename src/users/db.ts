import { logger } from "firebase-functions";
import {
  OrganizationConfigID,
  OrganizationID,
  TelegramUserID,
  UserID,
} from "../lib/types";
import { User } from "./types";
import {
  db,
  getNewOrganizationRef,
  getOrganizationConfigRef,
  getUserCollection,
  getUserRef,
} from "../lib/core";
import { Organization, OrganizationConfig } from "../organizations/types";

const DEFAULT_MAX_WALLETS_ALLOWED = 5;
const DEFAULT_DAO_FEE_BASIS_POINTS = 200; // 2%

export const getUserByID = async (userID: UserID): Promise<User | null> => {
  logger.info("Fetching user by user id", { userID });
  const user = await getUserRef(userID).get();
  const data = user.data();
  if (!user.exists || !data) {
    return null;
  }
  return data;
};

export const getUserByTelegramUserID = async (
  tgUserID: TelegramUserID
): Promise<User | null> => {
  logger.info("Fetching user by telegram user id", { tgUserID });
  const key: keyof User = "telegramUserID";
  const user = await getUserCollection().where(key, "==", tgUserID).get();
  const docs = user.docs.map((doc) => doc.data());
  return docs[0] || null;
};

interface CreateUserParams {
  id: UserID;
  telegramUserID: TelegramUserID;
  telegramUsername: string;
  telegramChatID: number;
  email: string | null;
  name: string | null;
  organizationPayload: {
    name: string;
  };
}
export const createUserWithOrganization = async (
  params: CreateUserParams
): Promise<{
  user: User;
  organization: Organization;
}> => {
  logger.info("Creating user", { params });
  const nowTimestamp = Date.now();
  // Run a transaction to batch write users
  const userRef = getUserRef(params.id);
  const organizationRef = getNewOrganizationRef();
  const configRef = getOrganizationConfigRef(
    organizationRef.id as OrganizationID
  );

  const userBody: User = {
    id: params.id,
    email: params.email,
    name: params.name,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp,
    deletedAt: null,
    telegramUserID: params.telegramUserID,
    telegramChatID: params.telegramChatID,
    telegramUsername: params.telegramUsername,
  };
  const organizationBody: Organization = {
    id: organizationRef.id as OrganizationID,
    foundingUserID: params.id,
    name: params.organizationPayload.name,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp,
    deletedAt: null,
  };
  const configBody: OrganizationConfig = {
    id: configRef.id as OrganizationConfigID,
    organizationID: organizationRef.id as OrganizationID,
    maxWalletsAllowed: DEFAULT_MAX_WALLETS_ALLOWED,
    defaultDaoFeeBasisPoints: DEFAULT_DAO_FEE_BASIS_POINTS,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp,
    deletedAt: null,
  };
  logger.info("User and org payloads", { userBody, organizationBody });
  await db.runTransaction(async (tx) => {
    tx.create(userRef, userBody);
    tx.create(organizationRef, organizationBody);
    tx.create(configRef, configBody);
  });

  return {
    user: userBody,
    organization: organizationBody,
  };
};
