import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'DandyDayCounter';
const COUNTER_ID = 'button-counter';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Helper function to log request details
const logRequest = (event: APIGatewayProxyEvent, context: string) => {
  console.log(`[${context}] Request received`, {
    path: event.path,
    method: event.httpMethod,
    sourceIp: event.requestContext?.identity?.sourceIp,
    userAgent: event.requestContext?.identity?.userAgent,
    timestamp: new Date().toISOString()
  });
};

export const handler: APIGatewayProxyHandler = async (event) => {
  // Log incoming request
  logRequest(event, 'START');

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path;
  
  try {
    // Handle increment counter (POST /statistics/button)
    if (path === '/statistics/button' && event.httpMethod === 'POST') {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: COUNTER_ID },
        UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :inc',
        ExpressionAttributeNames: {
          '#count': 'count'
        },
        ExpressionAttributeValues: {
          ':inc': 1,
          ':zero': 0
        },
        ReturnValues: 'ALL_NEW'
      });

      let response;
      try {
        response = await docClient.send(command);
      } catch (dbError) {
        console.error('[INCREMENT] DynamoDB error during increment', {
          error: dbError,
          tableName: TABLE_NAME,
          counterId: COUNTER_ID
        });
        // Return success with count 0 to not break frontend
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            count: 0,
            error: 'Failed to increment counter'
          })
        };
      }
      
      const count = response.Attributes?.count || 0;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: count
        })
      };
    }

    // Handle get counter (GET /statistics/button)
    if (path === '/statistics/button' && event.httpMethod === 'GET') {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: COUNTER_ID }
      });

      let response;
      try {
        response = await docClient.send(command);
        
        if (!response.Item) {
          console.warn('[GET] Counter not found, returning 0', {
            tableName: TABLE_NAME,
            counterId: COUNTER_ID
          });
        } else {
          console.log('[GET] Successfully retrieved counter', {
            count: response.Item.count,
            consumedCapacity: response.ConsumedCapacity
          });
        }
      } catch (dbError) {
        console.error('[GET] DynamoDB error during retrieval', {
          error: dbError,
          tableName: TABLE_NAME,
          counterId: COUNTER_ID
        });
        // Return 0 to not break frontend
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            count: 0,
            error: 'Failed to retrieve counter'
          })
        };
      }
      
      const count = response.Item?.count || 0;
      
      // Validate count is a number
      if (typeof count !== 'number') {
        console.error('[GET] Invalid count type in database', {
          countType: typeof count,
          countValue: count
        });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            count: 0
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          count: count
        })
      };
    }

    // 404 for unknown paths
    console.warn('[404] Unknown path requested', {
      path: event.path,
      method: event.httpMethod
    });
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    // Log unexpected errors with full context
    console.error('[ERROR] Unexpected error in handler', {
      error: error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      path: event.path,
      method: event.httpMethod,
      tableName: TABLE_NAME
    });
    
    // Return graceful error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        count: 0  // Include count: 0 so frontend can still display something
      })
    };
  }
};