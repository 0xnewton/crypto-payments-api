# Crypto Payments API

A Firebase Functions backend that creates dedicated deposit wallets (via Telegram bot or API), listens for on-chain token deposits through Alchemy webhooks, forwards the payment to a recipient address, takes a DAO fee, and notifies your system via a webhook.

## What it does

- Creates wallets per request (Telegram bot or REST API).
- Subscribes those wallets to Alchemy Address Activity webhooks.
- When a deposit is detected, records a webhook receipt in Firestore.
- Triggers a background function that:
  - Sends a webhook to your system (with an optional secret header).
  - Transfers the token deposit: fee to DAO + remainder to recipient.

## Architecture at a glance

- **Telegram Bot** (`telegramBot` function)
  - `/start` creates a user + org in Firebase Auth + Firestore.
  - `/generate_api_key` issues an API key.
  - `/create_wallet <chain> <recipient> <webhook_url> <secret?>` creates a wallet.
- **External API** (`externalAPI` function)
  - `POST /v1/wallet` creates wallets for authenticated orgs via API key.
- **Webhook Ingest** (`webhooksAPI` function)
  - `POST /webhook54825963` receives Alchemy webhooks and writes receipts.
- **Background Processor** (`onWebhookReceiptCreated`)
  - On Firestore insert, sends your webhook and triggers token transfers.

## Supported chains and tokens

Configured in `src/lib/constants/chains.ts` and `src/lib/constants/tokens.ts`.

- Chains (NetworkEnum values):
  - `base-mainnet`
  - `base-sepolia`
- ERC20 tokens (examples): USDC on Base mainnet + Sepolia, plus native ETH metadata.

## API usage

### Create wallet (External API)

`POST /v1/wallet`

Headers:
- `x-api-key: <api_key>`

Body:
```json
{
  "name": "Optional display name",
  "chain": "base-mainnet",
  "recipientAddress": "0xRecipientAddress...",
  "webhookURL": "https://your.app/webhooks/crypto",
  "webhookSecret": "optional-shared-secret",
  "apiMetadata": {
    "orderId": "abc123",
    "userId": "u_123"
  }
}
```

Response:
```json
{
  "success": true,
  "wallet": {
    "id": "walletId",
    "organizationID": "orgId",
    "name": "Wallet 1",
    "createdAt": 1700000000000,
    "updatedAt": 1700000000000,
    "deletedAt": null,
    "address": "0xDepositAddress...",
    "webhookURL": "https://your.app/webhooks/crypto",
    "daoFeeBasisPoints": 200,
    "recipientAddress": "0xRecipientAddress...",
    "metadata": {
      "orderId": "abc123"
    }
  }
}
```

### Telegram bot commands

- `/start`
  - Creates your user + org, sets default org config.
- `/generate_api_key`
  - Returns a one-time API key string.
- `/create_wallet <chain> <recipient> <webhook_url> <webhook_secret?>`
  - Example:
    - `/create_wallet base-mainnet 0xRecipient https://example.com/webhooks/payments mysecret`

## Webhooks

### 1) Alchemy -> this service (internal)

- The webhook URL passed to Alchemy is `WALLET_WEBHOOK_URL`.
- The route is hard-coded in `src/webhooks/functions/webhooksAPI/index.ts` as `/webhook54825963`.
- Incoming requests are verified using the Alchemy signature and a signing key stored in Google Secret Manager.

### 2) This service -> your system

When a deposit is detected, the service POSTs to the wallet's `webhookURL`.

Headers:
- `Content-Type: application/json`
- `X-Webhook-Secret: <decrypted secret>` (only if provided at wallet creation)

Payload:
```json
{
  "receivingAddress": "0xRecipientAddress...",
  "eventID": "alchemy_event_id",
  "contractAddress": "0xTokenAddress...",
  "contractDecimals": 6,
  "fromAddress": "0xSender...",
  "toAddress": "0xDepositAddress...",
  "value": 12.34,
  "rawValue": "12340000",
  "hash": "0xTxHash...",
  "asset": "USDC",
  "chain": "base-mainnet",
  "blockNum": "123456"
}
```

## Fee and transfer logic

- Each organization has a default DAO fee (basis points) set at creation.
- When a token deposit is detected, the background function:
  - Funds the deposit wallet with gas from a configured gas wallet.
  - Sends the DAO fee to the DAO recipient address.
  - Sends the remainder to the recipient address.

Defaults (from `src/users/db.ts`):
- `DEFAULT_DAO_FEE_BASIS_POINTS = 200` (2%).
- `DEFAULT_MAX_WALLETS_ALLOWED = 5`.

## Configuration

### Firebase config params (prompted at deploy)

- `KMS_LOCATION`
- `KMS_KEYRING`
- `KMS_PRIVATE_KEY_ENCRYPTOR`
- `KMS_WEBHOOK_SECRET_ENCRYPTOR`
- `DAO_TREASURY_EVM_ADDRESS`
- `WALLET_WEBHOOK_URL`

### Firebase secrets (set via CLI)

- `tg_bot_api_key`
- `tg_webhook_secret_token`
- `api_key_hmac_secret`
- `alchemy_api_key`
- `alchemy_auth_token`
- `gas_wallet_address_and_private_key` (format: `0xAddress::0xPrivateKey`)

Example secret setup:
```bash
firebase functions:secrets:set tg_bot_api_key
firebase functions:secrets:set tg_webhook_secret_token
firebase functions:secrets:set api_key_hmac_secret
firebase functions:secrets:set alchemy_api_key
firebase functions:secrets:set alchemy_auth_token
firebase functions:secrets:set gas_wallet_address_and_private_key
```

## Setup

1. Create a new GCP + Firebase project.
2. Enable: Firebase Functions, Firestore, Firebase Auth, KMS, Secret Manager.
3. Create an Alchemy account and obtain API key + auth token.
4. Create a Telegram bot and obtain the bot API key.
5. Clone and install dependencies:
   ```bash
   npm install
   ```
6. Update `.firebaserc` to point to your project.
7. Configure KMS keys (see `docs/INITIAL_SETUP.md`).
8. Deploy:
   ```bash
   npm run deploy
   ```
9. Set Telegram webhook URL:
   ```bash
   curl -H "Content-Type: application/json" -X POST \
     https://api.telegram.org/bot<BOT_API_KEY>/setWebhook \
     -d '{
       "url": "<TELEGRAM_FUNCTION_URL>",
       "secret_token": "<tg_webhook_secret_token>"
     }'
   ```

Notes:
- `WALLET_WEBHOOK_URL` should be the deployed `webhooksAPI` URL + `/webhook54825963`.
- `src/telegramBot/app.ts` currently hard-codes the Telegram webhook domain; update it to your deployed URL.

## Local development

```bash
npm run build
npm run serve
```

Other scripts:
- `npm run lint`
- `npm run deploy`

## Firestore collections

- `Organizations`
  - `OrganizationConfig/config`
  - `APIKeys`
  - `Wallets`
    - `SentWebhookReceipts`
- `Users`
- `WalletWebhooks`
  - `WebhookReceipts`

## Security notes

- Wallet private keys and webhook secrets are encrypted via GCP KMS.
- Alchemy signing keys are stored in Google Secret Manager.
- External API is protected by HMAC-based API keys.
- Telegram webhooks are gated by the `x-telegram-bot-api-secret-token` header.

## Troubleshooting

- `npm run logs` to view Cloud Function logs.
- If wallet creation fails, check KMS permissions and Secret Manager access.
- If webhooks do not fire, confirm `WALLET_WEBHOOK_URL` and Alchemy signing keys.
