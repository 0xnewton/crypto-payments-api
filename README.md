## Crypto Payments API

This is a REST API that lets organizations set up deposit notifications on new wallets. When a wallet receives funds, the organization is notified via webhook, and then the funds are transfered to a custodial wallet that the organization specified.

### Getting Started

Install the dependencies

```bash
npm install
```

Deploy the backend

```bash
npm run deploy
```

To view details on a full setup, see [INITIAL_SETUP.md](docs/INITIAL_SETUP.md)

### How it Works

This uses GCP & firebase under the hood. Users are created via a telegram bot which creates a user in firebase auth + firestore DB. There is also an organization record that gets created. This repo supports a multiple users <> organization relationship via the firebase auth secure `custom claims` feature. Each user claim can have a number of organizations and corresponding role in that organization (admin, editor, viewer etc).

### Example .env file

```
KMS_LOCATION=global
KMS_KEYRING=crypto-payments-keyring
KMS_PRIVATE_KEY_ENCRYPTOR=private-key-encryptor
KMS_WEBHOOK_SECRET_ENCRYPTOR=webhook-secret-encryptor
DAO_TREASURY_EVM_ADDRESS=0x2afe570752f3c5eBC545523695B4eA39b590fd6B
WALLET_WEBHOOK_URL=https://webhooksapi-rev27ez4rq-uc.a.run.app/webhook54825963
```
