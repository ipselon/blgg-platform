import {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import {PLATFORM_SYSTEM_TABLE_NAME, UserProfile} from 'common-utils';

const AWS_REGION: string | undefined = process.env.AWS_REGION;

const dynamoClient = new DynamoDBClient({region: AWS_REGION});

export async function createSysUserProfile(userId: string, userProfile: UserProfile): Promise<UserProfile> {
    const PK = `User#${userId}`;
    const SK = `#Profile#${userId}`;
    const selectParams = {
        TableName: PLATFORM_SYSTEM_TABLE_NAME,
        Key: {
            PK: { S: PK },
            SK: { S: SK }
        }
    };;
    const command = new GetItemCommand(selectParams);
    const response = await dynamoClient.send(command);
    if (response.Item) {
        const updateParams = {
            TableName: PLATFORM_SYSTEM_TABLE_NAME,
            Key: {
                PK: {S: PK},
                SK: {S: SK}
            },
            UpdateExpression: 'SET UserEmail = :userEmailValue, UserFullName = :userFullNameValue',
            ExpressionAttributeValues: {
                ':userEmailValue': {S: userProfile.email},
                ':userFullNameValue': {S: userProfile.fullName}
            }
        };
        const updateCommand = new UpdateItemCommand(updateParams);
        await dynamoClient.send(updateCommand);
    } else {
        // create new user profile
        const params = {
            TableName: PLATFORM_SYSTEM_TABLE_NAME,
            Item: {
                PK: {S: PK},
                SK: {S: SK},
                UserEmail: {S: userProfile.email},
                UserFullName: {S: userProfile.fullName}
            }
        };
        const command = new PutItemCommand(params);
        await dynamoClient.send(command);
    }
    return userProfile;
}

export async function getSysUserProfile(userId: string): Promise<UserProfile | undefined> {
    const PK = `User#${userId}`;
    const SK = `#Profile#${userId}`;
    const selectParams = {
        TableName: PLATFORM_SYSTEM_TABLE_NAME,
        Key: {
            PK: { S: PK },
            SK: { S: SK }
        }
    };;
    const command = new GetItemCommand(selectParams);
    const response = await dynamoClient.send(command);
    if (response.Item) {
        return {
            email: response.Item.UserEmail.S?.toString() || '',
            fullName: response.Item.UserFullName.S?.toString() || ''
        };
    }
    return undefined;
}
