import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { receiveWebhook } from "./handlers";

const app = express();

// General middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.post("/webhook54825963", receiveWebhook);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    secrets: [],
  },
  app
);
