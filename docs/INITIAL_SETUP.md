### Getting Started

Starting from the begining:

1. Create a new project on GCP & Firebase
2. Make sure GCP has the following enabled
   - Firebase functions
   - Firestore
   - KMS (Key Management Service)
   - GSM (Secret Manager)
3. Make an [alchemy account](https://dashboard.alchemy.com/) and get API key
4. Create the telegram bot if needed and get the private key
5. Clone the repository
6. Run `npm install`
7. Update project alias in `.firebaserc` to point to yours
8. Generate a new private key for telegram webhook authenntication (will be needed in deployement) - Use any secure random string generator
9. Run `npm run deploy` to deploy the backend
   - You will be prompted to enter the secrets
10. Set the telegram bot webhook url via
    ```
    curl -H "Content-Type: application/json" -X POST https://api.telegram.org/bot<BOT_API_KEY_FROM_STEP_4>/setWebhook -d '{
       "url": "<WEBHOOK_URL>",
       "secret_token": "<SECRET_TOKEN_FROM_STEP_8>"
    }'
    ```
    _Note: the WEBHOOK_URL is generated from deployment on step 9_
