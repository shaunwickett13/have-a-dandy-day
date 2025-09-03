# Deployment Instructions

## Prerequisites
- AWS Account with Amplify configured
- Node.js 18+ installed
- AWS CLI configured with appropriate credentials

## Backend Deployment

### Local Development (Sandbox)
1. Start the Amplify sandbox:
   ```bash
   npm run sandbox
   ```
2. The sandbox will output the API URL. Update `api-config.js` with this URL for local testing.

### Production Deployment
1. Deploy to Amplify Hosting:
   ```bash
   npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
   ```

2. After deployment, get the outputs and update the API config:
   ```bash
   APP_ID=YOUR_APP_ID BRANCH=main npm run deploy
   ```

3. The `api-config.js` file will be automatically updated with the production API URL.

## Frontend Deployment

The frontend files (`index.html`, `style.css`, `api-config.js`, etc.) should be deployed to your Amplify Hosting environment. They will automatically use the API URL from `api-config.js`.

## API Endpoints

- `POST /statistics/button` - Increment the counter
- `GET /statistics/button` - Get the current counter value

## Architecture

- **DynamoDB Table**: `DandyDayCounter` - Stores the button click count
- **Lambda Function**: `counter-api` - Handles API requests
- **API Gateway**: REST API with CORS enabled for all origins

## Notes

- The counter uses DynamoDB's atomic counter updates to ensure accuracy
- The API is public and doesn't require authentication
- CORS is configured to allow requests from any origin