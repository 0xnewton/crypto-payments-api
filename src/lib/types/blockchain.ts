import { StringParam } from "firebase-functions/lib/params/types";
import { Brand } from "./utils";

export type Address = Brand<string, "Address">;
export type PrivateKey = Brand<string, "PrivateKey">;

export interface Chain {
  name: string;
  evmChainId: number | null;
  rpcUrl: string;
  networkEnum: NetworkEnum;
  isTestnet: boolean;
  blockExplorerUrl: string;
  nativeCurrency: NativeEVMToken;
  tokens: ERC20Token[];
  daoFeeWallet: StringParam;
  isEVM: boolean;
}

export type ChainSnippet = Pick<Chain, "name" | "evmChainId" | "networkEnum">;

export enum NetworkEnum {
  BASE_MAINNET = "base-mainnet",
  /** TODO: remove testing */
  BASE_SEPOLIA = "base-sepolia",
}

export interface ERC20Token {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  chain: NetworkEnum;
}

export type NativeEVMToken = Omit<ERC20Token, "address">;

export type Token = ERC20Token | NativeEVMToken;

export interface WalletKeyPair {
  privateKey: PrivateKey;
  publicKey: Address;
}
