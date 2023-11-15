// import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

// const ssmClient = new SSMClient();
const dynamoDbClient = new DynamoDBClient();

export async function getProbeItems() {
    // Fetch the DynamoDB table name from SSM Parameter Store
    // const tableName = await getTableNameFromSSM('probe-table-name');
    const tableName = 'ProbeItems';

    // Read items from the DynamoDB table
    const items = await getItemsFromDynamoDbTable(tableName);
    return items;
}

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
