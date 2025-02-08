import { FetchResult, OrganizationID } from "../../lib/types";
import { getOrganizationConfig } from "../db";
import { OrganizationConfig } from "../types";

export const getConfig = async (
  id: OrganizationID
): Promise<FetchResult<OrganizationConfig> | null> => {
  return getOrganizationConfig(id);
};
