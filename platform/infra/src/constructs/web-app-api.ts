import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface WebAppApiConstructProps {
    probeTable: dynamodb.Table;
}

export class WebAppApiConstruct extends Construct {
    public readonly httpApi: apigwv2.HttpApi;

    constructor(scope: Construct, id: string, props: WebAppApiConstructProps) {
        super(scope, id);
        const {probeTable} = props;

        console.log('WebApp API Path: ', resolve('../web-app/dist'));
        const lambdaHandler = new lambda.Function(this, 'WebAppAdapterLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(resolve('../web-app/dist')),
            memorySize: 256
        });

        // Grant the Lambda function permission to read all SSM parameters
        lambdaHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
            resources: [`arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter/*`],
        }));

        // Grant the Lambda function read access to the DynamoDB table
        probeTable.grantReadData(lambdaHandler);

        // Define the HTTP API resource with the Lambda integration
        const lambdaIntegration = new apigwv2Integrations.HttpLambdaIntegration(
            'WebAppAdapterLambdaIntegration', lambdaHandler
        );

        this.httpApi = new apigwv2.HttpApi(this, 'WebAppApi', {
            defaultIntegration: lambdaIntegration
        });

        // Output the HTTP API URL to the stack outputs
        new cdk.CfnOutput(this, 'WebAppApiUrl', {
            value: this.httpApi.apiEndpoint,
        });
    }
}
