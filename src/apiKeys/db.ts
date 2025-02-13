import { logger } from "firebase-functions";
import { getAPIKeyCollectionGroup, getAPIKeyCollection } from "../lib/core";
import { OrganizationID, UserID } from "../lib/types";
import { APIKey } from "./types";

interface CreateAPIKeyParams {
  organizationID: OrganizationID;
  createdBy: UserID;
  hash: string;
}

export const createAPIKey = async (
  params: CreateAPIKeyParams
): Promise<APIKey> => {
  logger.info("Create API in database", { params });
  const collection = getAPIKeyCollection(params.organizationID);
  const docRef = collection.doc();
  const body: APIKey = {
    id: docRef.id,
    hash: params.hash,
    organizationID: params.organizationID,
    createdBy: params.createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    revokedAt: null,
  };

  await docRef.create(body);

  return body;
};

interface GetAPIKeyByHashParams {
  hash: string;
}
/**
 * Fetches an api key from its hash. Warning: the key could be revoked
 * @param params - The hash of the secret key
 * @returns The API key in database or null if not found
 */
export const getAPIKeyByHash = async (
  params: GetAPIKeyByHashParams
): Promise<APIKey | null> => {
  logger.info("Fetch API by hash", { params });
  const key: keyof APIKey = "hash";
  const apiKey = await getAPIKeyCollectionGroup()
    .where(key, "==", params.hash)
    .get();
  const docs = apiKey.docs.map((doc) => doc.data());
  return docs[0] || null;
};

export const getAPIKeyCount = async (
  organizationID: OrganizationID
): Promise<number> => {
  const revokedAtField: keyof APIKey = "revokedAt";
  const collection = getAPIKeyCollection(organizationID).where(
    revokedAtField,
    "==",
    null
  );
  const aggCount = collection.count();
  const snapshot = await aggCount.get();
  return snapshot.data().count;
};
