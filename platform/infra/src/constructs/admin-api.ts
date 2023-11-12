import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface AdminApiConstructProps {

}

export class AdminApiConstruct extends Construct {
    public readonly httpApi: apigwv2.HttpApi;

    constructor(scope: Construct, id: string, props?: AdminApiConstructProps) {
        super(scope, id);

        // Create a new DynamoDB table
        const table = new dynamodb.Table(this, 'ProbeTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            // add other properties as required
        });
        // Store the table name in AWS Systems Manager Parameter Store
        new ssm.StringParameter(this, 'ProbeTableNameParameter', {
            parameterName: 'probe-table-name',
            stringValue: table.tableName,
        });

        console.log('Admin API Path: ', resolve('../admin-api/dist'));
        const lambdaHandler = new lambda.Function(this, 'AdminApiProbeLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'probe.handler',
            code: lambda.Code.fromAsset(resolve('../admin-api/dist')),
            memorySize: 256
        });

        // Grant the Lambda function permission to read all SSM parameters
        lambdaHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
            resources: [`arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter/*`],
        }));

        // Grant the Lambda function read access to the DynamoDB table
        table.grantReadData(lambdaHandler);

        // Define the HTTP API resource with the Lambda integration
        const lambdaIntegration = new apigwv2Integrations.HttpLambdaIntegration(
            'AdminApiProbeLambdaIntegration', lambdaHandler
        );

        this.httpApi = new apigwv2.HttpApi(this, 'AdminApi');

        this.httpApi.addRoutes({
            path: '/api/probe',
            methods: [ apigwv2.HttpMethod.GET ],
            integration: lambdaIntegration,
        });

        // Output the HTTP API URL to the stack outputs
        new cdk.CfnOutput(this, 'AdminApiUrl', {
            value: this.httpApi.apiEndpoint,
        });
    }
}
