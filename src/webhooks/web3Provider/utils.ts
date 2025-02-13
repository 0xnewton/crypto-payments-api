import { Network } from "alchemy-sdk";
import { NetworkEnum } from "../../lib/types";

export const networkEnumToNetwork = (network: NetworkEnum): Network => {
  if (network === NetworkEnum.BASE_MAINNET) {
    return Network.BASE_MAINNET;
  }
  if (network === NetworkEnum.BASE_SEPOLIA) {
    return Network.BASE_SEPOLIA;
  }

  throw new Error(`Unknown network: ${network}`);
};
