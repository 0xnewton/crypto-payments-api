import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { demoWebhookHandler } from "./demoWebhookHandler";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.post("/demo-webhook-handler", demoWebhookHandler as any);

export const api = onRequest(
  {
    timeoutSeconds: 120,
  },
  app
);
