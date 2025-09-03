import { defineFunction } from '@aws-amplify/backend';

export const counterApi = defineFunction({
  name: 'counter-api',
  entry: './handler.ts',  // Explicitly specify the handler file
  runtime: 20,
  timeoutSeconds: 30,
  environment: {
    TABLE_NAME: 'DandyDayCounter'
  }
});