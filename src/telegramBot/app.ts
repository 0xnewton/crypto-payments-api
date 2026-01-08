import { onRequest } from "firebase-functions/v2/https";
import {
  alchemyAuthToken,
  alchemyAPIKey,
  apiKeyHMACSecret,
  tgBotAPIKey,
  tgWebhookSecretToken,
} from "../lib/core";
import { getBot } from "./bot";
import * as express from "express";
import { validateSecretToken } from "./middleware/validateSecretToken";

const expressApp = express();
expressApp.use(express.json());
expressApp.use(validateSecretToken);

expressApp.use(async (req, res, next) => {
  const bot = getBot();
  try {
    const hostHeader = req.headers["x-forwarded-host"] || req.headers.host;
    const protocolHeader = req.headers["x-forwarded-proto"] || "https";
    const host =
      typeof hostHeader === "string" ? hostHeader : hostHeader?.[0];
    const protocol =
      typeof protocolHeader === "string"
        ? protocolHeader
        : protocolHeader?.[0] || "https";
    const domain = host ? `${protocol}://${host}` : undefined;
    if (!domain) {
      throw new Error("Unable to determine Telegram webhook domain");
    }
    const webhookMiddleware = await bot.createWebhook({
      domain,
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
    secrets: [
      tgBotAPIKey,
      tgWebhookSecretToken,
      apiKeyHMACSecret,
      alchemyAPIKey,
      alchemyAuthToken,
    ],
    minInstances: 1,
  },
  expressApp
);
