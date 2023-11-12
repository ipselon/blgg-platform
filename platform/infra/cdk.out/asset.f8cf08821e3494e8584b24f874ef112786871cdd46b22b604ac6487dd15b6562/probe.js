'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_ssm_1 = require("@aws-sdk/client-ssm");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const ssmClient = new client_ssm_1.SSMClient();
const dynamoDbClient = new client_dynamodb_1.DynamoDBClient();
console.log(JSON.stringify(process.env, null, 4));
const handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    // Fetch the DynamoDB table name from SSM Parameter Store
    const tableName = await getTableNameFromSSM('probe-table-name');
    // Read items from the DynamoDB table
    const items = await getItemsFromDynamoDbTable(tableName);
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
    };
};
exports.handler = handler;
async function getTableNameFromSSM(parameterName) {
    const command = new client_ssm_1.GetParameterCommand({ Name: parameterName });
    const response = await ssmClient.send(command);
    if (!response.Parameter?.Value) {
        throw new Error(`Parameter ${parameterName} not found`);
    }
    return response.Parameter.Value;
}
async function getItemsFromDynamoDbTable(tableName) {
    const command = new client_dynamodb_1.ScanCommand({ TableName: tableName });
    const response = await dynamoDbClient.send(command);
    return response.Items || [];
}
