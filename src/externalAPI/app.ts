import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { createWallet } from "./handlers";
import { validateAPIKey, limiter, speedLimiter } from "./middleware";
import { alchemyAuthToken, alchemyAPIKey, apiKeyHMACSecret } from "../lib/core";
import { bodySchemaValidator } from "./middleware/bodySchemaValidator";
import { createWalletByAPIReqBodySchema } from "./handlers/createWallet.validator";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// General middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.set("trust proxy", 1); // Enables the rate limiting to work behind a proxy (like firebase functions)

// Set up public api routes protected by user api keys
app.use(limiter);
app.use(speedLimiter);
app.use(validateAPIKey);

app.post(
  "/v1/wallet",
  [bodySchemaValidator(createWalletByAPIReqBodySchema)],
  createWallet
);

app.use(errorHandler);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    secrets: [apiKeyHMACSecret, alchemyAPIKey, alchemyAuthToken],
    minInstances: 1,
  },
  app
);
