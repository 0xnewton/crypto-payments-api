import {
  OrganizationConfigID,
  OrganizationID,
  UnixTimestamp,
  UserID,
} from "../lib/types";

export interface Organization {
  id: OrganizationID;
  foundingUserID: UserID;
  name: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  deletedAt: UnixTimestamp | null;
}

export interface OrganizationConfig {
  id: OrganizationConfigID;
  organizationID: OrganizationID;
  /**
   * Maximum wallets the organization can make
   */
  maxWalletsAllowed: number;
  /**
   * Fee that is charged by the DAO for using the wallet in basis points,
   * i.e. 100% = 10000, 1% = 100, 0.01% = 1
   */
  defaultDaoFeeBasisPoints: number;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  deletedAt: UnixTimestamp | null;
}
