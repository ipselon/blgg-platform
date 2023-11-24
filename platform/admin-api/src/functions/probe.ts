import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
// import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {PLATFORM_PROBE_TABLE_NAME} from 'common-utils';

// const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient();

// console.log(JSON.stringify(process.env, null, 4));

export const handler = async function(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log("request:", JSON.stringify(event, undefined, 2));

    // Fetch the DynamoDB table name from SSM Parameter Store
    // const tableName = await getTableNameFromSSM('probe-table-name');
    const tableName = PLATFORM_PROBE_TABLE_NAME;

    // Read items from the DynamoDB table
    const items = await getItemsFromDynamoDbTable(tableName);

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
    };
};

// async function getTableNameFromSSM(parameterName: string): Promise<string> {
//     const command = new GetParameterCommand({ Name: parameterName });
//     const response = await ssmClient.send(command);
//
//     if (!response.Parameter?.Value) {
//         throw new Error(`Parameter ${parameterName} not found`);
//     }
//
//     return response.Parameter.Value;
// }

async function getItemsFromDynamoDbTable(tableName: string): Promise<any[]> {
    const command = new ScanCommand({ TableName: tableName });
    const response = await dynamoDbClient.send(command);

    return response.Items || [];
}
