import { app as telegramBot } from "./telegramBot";
import { externalAPI } from "./externalAPI";
import {
  api as webhooksAPI,
  onWebhookReceiptCreated,
} from "./webhooks/functions";
import { externalAPI as demoAPI } from "./demo";

export { telegramBot };
export { externalAPI };
export { webhooksAPI };
export { onWebhookReceiptCreated };
export { demoAPI };
