import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import {readApiEndpointNames} from 'common-utils';

export interface AdminApiConstructProps {
    tables: Array<dynamodb.Table>;
}

export class AdminApiConstruct extends Construct {
    public readonly httpApi: apigwv2.HttpApi;
    public readonly httpApiGatewayOrigin: origins.HttpOrigin;

    constructor(scope: Construct, id: string, props: AdminApiConstructProps) {
        super(scope, id);
        const {tables} = props;

        this.httpApi = new apigwv2.HttpApi(this, 'AdminApi');

        const apiDirectoryPath = resolve('../admin-api/dist/functions');
        console.log('Admin API Path: ', apiDirectoryPath);
        const apiEndpointNames = readApiEndpointNames(apiDirectoryPath);
        if (apiEndpointNames.length > 0) {
            const handlers: Array<lambda.Function> = [];
            for (const apiEndpointName of apiEndpointNames) {
                const lambdaHandler = new lambda.Function(this, `AdminApiLambda_${apiEndpointName}`, {
                    runtime: lambda.Runtime.NODEJS_18_X,
                    handler: `${apiEndpointName}.handler`,
                    code: lambda.Code.fromAsset(apiDirectoryPath),
                    memorySize: 256,
                    description: `Admin API Lambda. The ${apiEndpointName} endpoint`
                });

                // Grant the Lambda function permission to read all SSM parameters
                lambdaHandler.addToRolePolicy(new iam.PolicyStatement({
                    actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
                    resources: [`arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter/*`],
                }));

                // Define the HTTP API resource with the Lambda integration
                const lambdaIntegration = new apigwv2Integrations.HttpLambdaIntegration(
                    `AdminApiLambdaIntegration_${apiEndpointName}`, lambdaHandler
                );

                this.httpApi.addRoutes({
                    path: `/api/${apiEndpointName}`,
                    methods: [ apigwv2.HttpMethod.GET ],
                    integration: lambdaIntegration,
                });

                handlers.push(lambdaHandler);
            }
            for (const handler of handlers) {
                if (tables.length > 0) {
                    for (const table of tables) {
                        // Grant the Lambda function read access to the DynamoDB table
                        table.grantReadData(handler);
                    }
                }
            }
        }

        // Define the HTTP Admin API Gateway endpoint as a custom origin
        const region = cdk.Stack.of(this).region;
        const adminApiId = this.httpApi.apiId;
        this.httpApiGatewayOrigin = new origins.HttpOrigin(`${adminApiId}.execute-api.${region}.amazonaws.com`, {
            // Optionally, configure origin properties like custom headers, SSL protocols, etc.
            // If you have a custom domain name for your CloudFront distribution
            // and you want your application to be aware of this custom domain,
            // you should set the X-Forwarded-Host header to this custom domain name.
            // customHeaders: {
            //     'X-Forwarded-Host': hostValue
            // }
        });

        // Output the HTTP API URL to the stack outputs
        // new cdk.CfnOutput(this, 'AdminApiUrl', {
        //     value: this.httpApi.apiEndpoint,
        // });
    }
}
