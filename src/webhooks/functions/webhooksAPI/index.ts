import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { onWebhookReceived } from "./handlers";
import { alchemySigningToken } from "../../../lib/core";
import {
  addAlchemyContextToRequest,
  validateAlchemySignature,
} from "../middleware";
import { logger } from "firebase-functions";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use((req, _res, next) => {
  logger.info("Incoming request", { headers: req.headers });
  next();
});

app.use(addAlchemyContextToRequest);

// Alchemy-specific middleware (keeps signature validation after raw body is captured)
app.use(validateAlchemySignature());

app.post("/webhook54825963", onWebhookReceived);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    secrets: [alchemySigningToken],
  },
  app
);
