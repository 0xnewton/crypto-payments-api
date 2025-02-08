import { logger } from "firebase-functions";
import { BotContext } from "../types";
import {
  CreateWalletPayload,
  createWalletValidator,
} from "./createWallet.validator";
import {
  getUserContext,
  SOMETHING_WENT_WRONG_MESSAGE,
  UNREGISTERED_USER_MESSAGE,
} from "../utils";
import { TGUserNotFoundError } from "../../users/errors";
import * as walletService from "../../wallets/service";
import { isEditableRole } from "../../users/utils";
import { Organization } from "../../organizations/types";
import { User, UserRole } from "../../users/types";
import { FetchResult } from "../../lib/types";
import { WalletSource } from "../../wallets/types";

export const createWallet = async (ctx: BotContext) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  logger.info("Create wallet telegram bot service hit", {
    text,
  });

  //   `Usage: /${Commands.createWallet} <chain> <recipientAddress> <webhook_url> <webhook_secret (optional)>\n` +
  const args = text.split(" ").slice(1); // Extract arguments from the command
  const [chain, recipientAddress, webhookURL, webhookSecret] = args;
  const unsafeCreateWalletPayload: Record<string, unknown> = {
    chain,
    recipientAddress,
    webhookURL,
    webhookSecret,
  };

  if (!ctx.from) {
    logger.info("Unable to retrieve user details", { ctx });
    ctx.reply("Unable to retrieve your user details. Please try again.");
    return;
  }

  // Validate the input
  let createWalletPayload: CreateWalletPayload;
  try {
    createWalletPayload = createWalletValidator.parse(
      unsafeCreateWalletPayload
    );
  } catch (err: any) {
    logger.info("Invalid input", { err });
    ctx.reply(`Invalid input. ${err?.message}`);
    return;
  }

  ctx.reply("Creating wallet... Please wait.");

  let user: FetchResult<User>;
  let organization: FetchResult<Organization>;
  let role: UserRole;
  try {
    ({ user, organization, role } = await getUserContext(ctx));
  } catch (err: any) {
    if (err instanceof TGUserNotFoundError) {
      ctx.reply(UNREGISTERED_USER_MESSAGE);
      return;
    }
    logger.error("Error fetching user", {
      errMessag: err?.message,
      code: err?.code,
    });
    ctx.reply(SOMETHING_WENT_WRONG_MESSAGE);
    return;
  }

  if (!isEditableRole(role)) {
    ctx.reply("You do not have permission to create a wallet.");
    return;
  }

  // Call the create wallet service
  try {
    const result = await walletService.create({
      organizationID: organization.data.id,
      payload: {
        webhookURL: createWalletPayload.webhookURL,
        webhookSecret: createWalletPayload.webhookSecret,
        networkEnum: createWalletPayload.chain,
        recipientAddress: createWalletPayload.recipientAddress,
        source: WalletSource.Telegram,
      },
      cache: {
        organization,
        user,
      },
    });
    ctx.reply(
      "Wallet created successfully!\n" +
        `Address: ${result.data.address}\n` +
        `Recipient Address: ${result.data.recipientAddress}\n` +
        `Webhook URL: ${result.data.webhookURL}\n` +
        "You will receive a webhook notification whe the wallet is funded."
    );
  } catch (err: any) {
    logger.error("Error creating wallet", {
      errMessage: err?.message,
      code: err?.code,
    });
    ctx.reply(SOMETHING_WENT_WRONG_MESSAGE);
  }
};
