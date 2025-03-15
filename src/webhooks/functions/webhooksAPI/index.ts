import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { onWebhookReceived } from "./handlers";
import {
  addAlchemyContextToRequest,
  validateAlchemySignature,
} from "../middleware";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(addAlchemyContextToRequest);

// Alchemy-specific middleware (keeps signature validation after raw body is captured)
app.use(validateAlchemySignature());

app.post("/webhook54825963", onWebhookReceived);

export const api = onRequest(
  {
    timeoutSeconds: 120,
  },
  app
);
