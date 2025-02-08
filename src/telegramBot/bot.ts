import { Telegraf, Context } from "telegraf";
import * as botService from "./service";
import { TelegrafBot } from "./types";

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
    description: `Create a new wallet. Usage: /${Commands.createWallet} <chain> <0xrecipientAddress> <webhook_url> <webhook_secret (optional)>`,
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
