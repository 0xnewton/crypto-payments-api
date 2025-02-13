import { Alchemy } from "alchemy-sdk";
import { NetworkEnum } from "../../lib/types";
import { networkEnumToNetwork } from "./utils";
import { alchemyAPIKey } from "../../lib/core";

const web3ClientMap: Partial<Record<NetworkEnum, Alchemy>> = {};

export const getClient = (network: NetworkEnum): Alchemy => {
  const apiKey = alchemyAPIKey.value();
  if (!apiKey) {
    throw new Error("No Alchemy API key provided");
  }
  if (!web3ClientMap[network]) {
    web3ClientMap[network] = new Alchemy({
      network: networkEnumToNetwork(network),
      apiKey: process.env.ALCHEMY_API_KEY,
    });
  }

  const client = web3ClientMap[network];
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};
