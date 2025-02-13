import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import {
  DBCollections,
  OrganizationID,
  UserID,
  APIKeyID,
  WalletID,
  WalletWebhookID,
} from "../types";
import { db } from "./platform";
import { User } from "../../users/types";
import { Organization, OrganizationConfig } from "../../organizations/types";
import { APIKey } from "../../apiKeys/types";
import { Wallet } from "../../wallets/types";
import { WalletWebhook } from "../../webhooks/types";

export const getUserCollection = () => {
  return db.collection(DBCollections.Users) as CollectionReference<User>;
};

export const getUserRef = (id: UserID) => {
  return getUserCollection().doc(id);
};

export const getOrganizationCollection = () => {
  return db.collection(
    DBCollections.Organizations
  ) as CollectionReference<Organization>;
};

export const getOrganizationRef = (id: OrganizationID) => {
  return getOrganizationCollection().doc(id);
};

export const getNewOrganizationRef = () => {
  return getOrganizationCollection().doc();
};

export const getAPIKeyCollection = (organizationID: OrganizationID) => {
  return getOrganizationRef(organizationID).collection(
    DBCollections.APIKeys
  ) as CollectionReference<APIKey>;
};

export const getAPIKeyDoc = (organizationID: OrganizationID, id: APIKeyID) => {
  return getAPIKeyCollection(organizationID).doc(id);
};

export const getAPIKeyCollectionGroup = () => {
  return db.collectionGroup(DBCollections.APIKeys) as CollectionGroup<APIKey>;
};

export const getWalletCollection = (organizationID: OrganizationID) => {
  return getOrganizationRef(organizationID).collection(
    DBCollections.Wallets
  ) as CollectionReference<Wallet>;
};

export const getNewWalletRef = (organizationID: OrganizationID) => {
  return getWalletCollection(organizationID).doc();
};

export const getWalletDoc = (organizationID: OrganizationID, id: WalletID) => {
  return getWalletCollection(organizationID).doc(id);
};

export const getWalletCollectionGroup = () => {
  return db.collectionGroup(DBCollections.Wallets) as CollectionGroup<Wallet>;
};

export const getOrganizationConfigRef = (organizationID: OrganizationID) => {
  return getOrganizationRef(organizationID)
    .collection(DBCollections.OrganizationConfig)
    .doc("config") as DocumentReference<OrganizationConfig>;
};

export const getWalletWebhookCollection = () => {
  return db.collection(
    DBCollections.WalletWebhooks
  ) as CollectionReference<WalletWebhook>;
};

export const getWalletWebhookDoc = (id: WalletWebhookID) => {
  return getWalletWebhookCollection().doc(id);
};
