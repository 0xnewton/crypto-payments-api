import { getClient } from "./client";
import { Address, NetworkEnum } from "../../lib/types";
import { WebhookType } from "alchemy-sdk";
import { networkEnumToNetwork } from "./utils";
import { logger } from "firebase-functions";

interface CreateWalletWebhookInProviderParams {
  payload: {
    webhookURL: string;
    chain: NetworkEnum;
    addresses: Address[];
  };
}
export const createWalletWebhook = async (
  params: CreateWalletWebhookInProviderParams
) => {
  logger.info("Creating webhook in web3 provider", {
    chain: params.payload.chain,
    addresses: params.payload.addresses,
  });
  const client = getClient(params.payload.chain);

  const addressActivityWebhook = await client.notify.createWebhook(
    params.payload.webhookURL,
    WebhookType.ADDRESS_ACTIVITY,
    {
      addresses: params.payload.addresses,
      network: networkEnumToNetwork(params.payload.chain),
    }
  );

  return addressActivityWebhook;
};

export const deleteWalletWebhook = async (
  webhookID: string,
  network: NetworkEnum
) => {
  logger.info("Deleting webhook in web3 provideer", { webhookID });
  const client = getClient(network);

  await client.notify.deleteWebhook(webhookID);

  return true;
};

export const addOrRemoveAddresses = async (
  webhookID: string,
  network: NetworkEnum,
  add: Address[],
  remove: Address[]
) => {
  logger.info("Adding or removing addresses from webhook", {
    webhookID,
    add,
    remove,
  });
  const client = getClient(network);

  await client.notify.updateWebhook(webhookID, {
    addAddresses: add,
    removeAddresses: remove,
  });

  return;
};
