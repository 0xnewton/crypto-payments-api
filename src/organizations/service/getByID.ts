import { OrganizationID } from "../../lib/types";
import { getOrganizationByID } from "../db";
import { Organization } from "../types";

export const getByID = async (
  id: OrganizationID
): Promise<Organization | null> => {
  const organization = await getOrganizationByID(id);
  return organization;
};
