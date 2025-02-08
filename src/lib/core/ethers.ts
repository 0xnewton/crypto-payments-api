import { Wallet } from "ethers";
import { Address, PrivateKey, WalletKeyPair } from "../types";

export const generateWalletKeyPair = (): WalletKeyPair => {
  // Generates a new random wallet
  const wallet = Wallet.createRandom();

  // Extract useful details
  const address = wallet.address as Address;
  const privateKey = wallet.privateKey as PrivateKey;
  // const mnemonic: string | undefined = wallet.mnemonic?.phrase;

  return { privateKey, publicKey: address };
};
