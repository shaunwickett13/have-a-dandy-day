import { defineBackend } from '@aws-amplify/backend';
import { counterApi } from './functions/counter-api/resource';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

/**
 * Backend for Have A Dandy Day - Counter API only
 */
const backend = defineBackend({
  counterApi
});

// Create a DynamoDB table for the counter
const counterStack = backend.createStack('counter-stack');

const counterTable = new Table(counterStack, 'DandyDayCounterTable', {
  tableName: 'DandyDayCounter',
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING
  },
  billingMode: BillingMode.PAY_PER_REQUEST
});

// Grant the Lambda function permissions to read/write to the table
counterTable.grantReadWriteData(backend.counterApi.resources.lambda);

// Create REST API
const api = new LambdaRestApi(counterStack, 'DandyDayApi', {
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