import { Telegraf, Context } from "telegraf";
import * as botService from "./service";
import { TelegrafBot } from "./types";
import { SUPPORTED_CHAINS } from "../lib/constants";

enum Commands {
  start = "start",
  generateAPIKey = "generate_api_key",
  createWallet = "create_wallet",
}

// Define bot commands (note: parameters are not defined here)
const commands = [
  {
    command: Commands.start,
    description: "Register your account",
  },
  {
    command: Commands.generateAPIKey,
    description: "Generate an API key for our REST API",
  },
  {
    command: Commands.createWallet,
    description:
      "Create a new wallet\n" +
      `Usage: /${Commands.createWallet} <chain> <recipientAddress> <webhook_url> <webhook_secret (optional)>\n` +
      `- <chain> is one of: ${SUPPORTED_CHAINS.map((c) => c.networkEnum).join(", ")}\n` +
      "<recipientAddress> is the address that will receive the funds\n" +
      "<webhook_url> is the URL that will receive the webhook on payment received\n" +
      // eslint-disable-next-line quotes
      '<webhook_secret> is a highly recommended but optional secret to authenticate the webhook is comming from us and is included in the "X-Webhook-Secret" header',
  },
];

// Define as a singleton
let bot: TelegrafBot | null = null;

export const initializeBot = (apiKey: string): TelegrafBot => {
  if (bot) {
    return bot;
  }

  bot = new Telegraf<Context>(apiKey);

  bot.telegram.setMyCommands(commands);

  bot.start(async (ctx: Context) => {
    await botService.signup(ctx);
  });

  bot.command(Commands.generateAPIKey, async (ctx: Context) => {
    await botService.generateAPIKey(ctx);
  });

  bot.command(Commands.createWallet, async (ctx: Context) => {
    await botService.createWallet(ctx);
  });

  return bot;
};
