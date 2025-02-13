import { logger } from "firebase-functions";
import { APIRequest, APIResponse, CreateWalletResponseV1 } from "../types";
import * as walletService from "../../wallets/service";
import { APIError } from "../errors";
import { CreateWalletByAPIReqBodySchema } from "./createWallet.validator";
import { WalletSource } from "../../wallets/types";
import { walletV1 } from "../converters";

const createWallet = async (req: APIRequest, res: APIResponse) => {
  logger.info("Create wallet external API hit");

  const { organization, body } = req;
  // Body validated in middleware
  const parsedBody = body as CreateWalletByAPIReqBodySchema;

  if (!organization) {
    throw new APIError(401, {
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const wallet = await walletService.create({
      organizationID: organization.id,
      payload: {
        name: parsedBody.name,
        webhookURL: parsedBody.webhookURL,
        webhookSecret: parsedBody.webhookSecret,
        networkEnum: parsedBody.chain,
        recipientAddress: parsedBody.recipientAddress,
        source: WalletSource.ExternalAPI,
        apiMetadata: parsedBody.apiMetadata,
      },
      cache: {
        organization,
      },
    });
    const response: CreateWalletResponseV1 = {
      success: true,
      wallet: walletV1(wallet),
    };
    res.json(response);
    return;
  } catch (err: any) {
    logger.error("Error creating wallet", {
      error: err?.message,
    });
    throw new APIError(400, {
      success: false,
      message: err?.message,
    });
  }
};

export default createWallet;
