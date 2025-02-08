import { logger } from "firebase-functions";
import { FetchResult, OrganizationID } from "../lib/types";
import { getOrganizationConfigRef, getOrganizationRef } from "../lib/core";
import { Organization, OrganizationConfig } from "./types";

export const deleteOrganization = async (id: OrganizationID): Promise<void> => {
  logger.info("Deleting organization", { id });
  const docRef = getOrganizationRef(id);
  await docRef.delete();
  return;
};

export const getOrganizationByID = async (
  id: OrganizationID
): Promise<FetchResult<Organization> | null> => {
  logger.info("Getting organization by ID", { id });
  const docRef = getOrganizationRef(id);
  const doc = await docRef.get();
  const data = doc.data();
  if (!doc.exists || !data) {
    logger.error("Organization not found", { id });
    return null;
  }
  return { data, ref: docRef };
};

export const getOrganizationConfig = async (
  organizationID: OrganizationID
): Promise<FetchResult<OrganizationConfig> | null> => {
  const doc = await getOrganizationConfigRef(organizationID).get();
  const data = doc.data();
  if (!doc.exists || !data) {
    logger.error("Organization config not found", { organizationID });
    return null;
  }
  return { data, ref: doc.ref };
};
