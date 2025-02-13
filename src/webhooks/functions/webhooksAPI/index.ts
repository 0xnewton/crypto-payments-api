import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { onWebhookReceived } from "./handlers";

const app = express();

// General middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.post("/webhook54825963", onWebhookReceived);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    secrets: [],
  },
  app
);
