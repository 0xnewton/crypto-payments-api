import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

export const demoWebhookHandler = onRequest(async (req, res) => {
  const body = req.body;
  logger.info("Demo Webhook Handler", { body });
  res.status(200).send("OK");
});
