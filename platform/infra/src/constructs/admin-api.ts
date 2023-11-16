import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as apigwv2Integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export interface AdminApiConstructProps {
    probeTable: dynamodb.Table;
}

export class AdminApiConstruct extends Construct {
    public readonly httpApi: apigwv2.HttpApi;
    public readonly httpApiGatewayOrigin: origins.HttpOrigin;

    constructor(scope: Construct, id: string, props: AdminApiConstructProps) {
        super(scope, id);
        const {probeTable} = props;

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
        probeTable.grantReadData(lambdaHandler);

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
