import {
  ERC20Token,
  Address,
  NativeEVMToken,
  NetworkEnum,
  Token,
} from "../types";

export const ETH_BASE_MAINNET: NativeEVMToken = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  chain: NetworkEnum.BASE_MAINNET,
};

export const ETH_BASE_SEPOLIA: NativeEVMToken = {
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  chain: NetworkEnum.BASE_SEPOLIA,
};

export const SUPPORTED_TOKENS: Token[] = [
  ETH_BASE_MAINNET,
  ETH_BASE_SEPOLIA,
  // USDC Base Mainnet
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    chain: NetworkEnum.BASE_MAINNET,
  },
  // USDC Base Sepolia
  {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    chain: NetworkEnum.BASE_SEPOLIA,
  },
];

export const getChainTokens = (chain: NetworkEnum): Token[] => {
  return SUPPORTED_TOKENS.filter((t) => t.chain === chain);
};

export const getChainERC20Tokens = (chain: NetworkEnum): ERC20Token[] => {
  return getChainTokens(chain).filter((t): t is ERC20Token => "address" in t);
};
