## Getting Started

To setup this project in a brand new environment, follow these steps:

1. Create a new project on GCP & Firebase
2. Make sure GCP has the following enabled

   - Firebase functions
   - Firestore
   - Firebase Authentication
   - KMS (Key Management Service)
     - See [KMS setup details](#google-key-management-system-kms-setup)
   - GSM (Google Secret Manager)

3. Make an [alchemy account](https://dashboard.alchemy.com/) and get API key
4. Create the telegram bot if needed and get the private key
5. Clone the repository
6. Run `npm install`
7. Update project alias in `.firebaserc` to point to yours
8. Generate secret private key for telegram webhook authentication - use any secure random string generator
9. Run `npm run deploy` to deploy the backend
   - You will be prompted to enter the secrets & config ([see here](#secrets-and-environment-variables))
10. Set the telegram bot webhook url via
    ```bash
    curl -H "Content-Type: application/json" -X POST https://api.telegram.org/bot<BOT_API_KEY_FROM_STEP_4>/setWebhook -d '{
       "url": "<WEBHOOK_URL>",
       "secret_token": "<SECRET_TOKEN_FROM_STEP_8>"
    }'
    ```
    _Note: the WEBHOOK_URL is generated from deployment on step 9_

## Secrets and Environment Variables

Todo: add details about them

## Google Key Management System (KMS) Setup

We use Google Key Management System (KMS) to manage encryption keys for variables secrets. To set it up:

1. Enable the api
2. [Review this documentation](https://cloud.google.com/kms/docs/create-encryption-keys) on setting it up
3. Init `gcloud` cli
4. Create a keyring
   ```bash
   gcloud kms keyrings create "crypto-payments-keyring" \
       --location "global"
   ```
5. Create 2 keys in that keyring

   ```bash
   gcloud init
   gcloud kms keys create "private-key-encryptor" \
       --location "global" \
       --keyring "crypto-payments-keyring" \
       --purpose "encryption"
   gcloud kms keys create "webhook-secret-encryptor" \
       --location "global" \
       --keyring "crypto-payments-keyring" \
       --purpose "encryption"
   ```

   These values will be used in the deployment step when setting up the config

6. Grant the `KMS Crypto Key Encryptor` role to the default compute service account (i.e. `53748573432-compute@developer.gserviceaccount.com`) or the service account running your functions.
