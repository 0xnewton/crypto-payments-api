import { onRequest } from "firebase-functions/v2/https";
import {
  apiKeyHMACSecret,
  tgBotAPIKey,
  tgWebhookSecretToken,
} from "../lib/core";
import { initializeBot } from "./bot";
import * as express from "express";
import { TelegrafBot } from "./types";

const expressApp = express();
expressApp.use(express.json());

let bot: TelegrafBot | null = null;

expressApp.use(async (req, res, next) => {
  if (!bot) {
    bot = initializeBot();
  }
  try {
    const webhookMiddleware = await bot.createWebhook({
      domain: "https://telegrambot-rev27ez4rq-uc.a.run.app",
      secret_token: tgWebhookSecretToken.value(),
    });
    // Mount the webhook middleware so that future requests get processed
    expressApp.use(webhookMiddleware);
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).send("Error initializing bot webhook");
    return;
  }
  next();
});

// Set up webhook for Telegram bot
export const app = onRequest(
  {
    secrets: [tgBotAPIKey, tgWebhookSecretToken, apiKeyHMACSecret],
    minInstances: 1,
  },
  expressApp
);
