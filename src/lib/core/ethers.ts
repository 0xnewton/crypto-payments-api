import { JsonRpcProvider, Provider, Wallet } from "ethers";
import { Address, NetworkEnum, PrivateKey, WalletKeyPair } from "../types";
import { supportedChains } from "../constants";
import { logger } from "firebase-functions";

export const generateWalletKeyPair = (): WalletKeyPair => {
  // Generates a new random wallet
  const wallet = Wallet.createRandom();

  // Extract useful details
  const address = wallet.address as Address;
  const privateKey = wallet.privateKey as PrivateKey;
  // const mnemonic: string | undefined = wallet.mnemonic?.phrase;

  return { privateKey, publicKey: address };
};

export const getProviderForChain = (networkEnum: NetworkEnum): Provider => {
  logger.info("Getting provider for chain", { networkEnum });
  const chain = supportedChains.find(
    (chain) => chain.networkEnum === networkEnum
  );
  // const rpcUrl = supportedChains[chain];
  if (!chain) {
    logger.error("Chain not configured", { networkEnum });
    throw new Error(`Chain not configured: ${networkEnum}`);
  }
  const rpcUrl = chain.rpcUrl;
  return new JsonRpcProvider(rpcUrl);
};
