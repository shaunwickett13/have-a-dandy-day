import { defineBackend } from '@aws-amplify/backend';
import { counterApi } from './functions/counter-api/resource';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Stack } from 'aws-cdk-lib';

/**
 * Backend for Have A Dandy Day - Counter API only
 */
const backend = defineBackend({
  counterApi
});

// Get the underlying stack from the function
const functionStack = Stack.of(backend.counterApi.resources.lambda);

// Create DynamoDB table in the same stack as the Lambda function
const counterTable = new Table(functionStack, 'DandyDayCounterTable', {
  tableName: 'DandyDayCounter',
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING
  },
  billingMode: BillingMode.PAY_PER_REQUEST
});

// Grant the Lambda function permissions to read/write to the table
counterTable.grantReadWriteData(backend.counterApi.resources.lambda);

// Create REST API in the same stack
const api = new LambdaRestApi(functionStack, 'DandyDayApi', {
  handler: backend.counterApi.resources.lambda,
  proxy: true,
  restApiName: 'DandyDayApi',
  defaultCorsPreflightOptions: {
    allowOrigins: ['*'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  }
});

// Add the API URL to the stack outputs
backend.addOutput({
  custom: {
    API_URL: api.url
  }
});