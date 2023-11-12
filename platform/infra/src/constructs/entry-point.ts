import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';

export interface EntryPointConstructProps {
    adminHttpApi: apigwv2.HttpApi;
    adminPwaBucket: s3.Bucket;
    websiteBucket: s3.Bucket;
}

export class EntryPointConstruct extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: EntryPointConstructProps) {
        super(scope, id);

        // Define the OAIs for CloudFront to access the S3 buckets
        const websiteOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'WebsiteOAI');
        props.websiteBucket.grantRead(websiteOriginAccessIdentity);
        const adminPwaOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'AdminPwaOAI');
        props.adminPwaBucket.grantRead(adminPwaOriginAccessIdentity);

        // Define the HTTP API Gateway endpoint as a custom origin
        const apiId = props.adminHttpApi.apiId;
        const region = cdk.Stack.of(this).region;
        const httpApiGatewayOrigin = new origins.HttpOrigin(`${apiId}.execute-api.${region}.amazonaws.com`, {
            // Optionally, configure origin properties like custom headers, SSL protocols, etc.
        });

        const adminRewriteFunction = new cloudfront.Function(this, 'AdminRewriteFunction', {
            code: cloudfront.FunctionCode.fromInline(`
                function handler(event) {
                    var request = event.request;
                    var uri = request.uri;
        
                    // Check if URI is ending with '/admin' or '/admin/'
                    if (uri.endsWith('/admin') || uri.endsWith('/admin/')) {
                        // Rewrite URI to '/admin/index.html'
                        request.uri = '/admin/index.html';
                    }
                    return request;
                }
            `),
        });

        // Create the CloudFront distribution
        this.distribution = new cloudfront.Distribution(this, 'EntryPointDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(props.websiteBucket, {
                    originAccessIdentity: websiteOriginAccessIdentity
                }),
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            additionalBehaviors: {
                '/admin': {
                    origin: new origins.S3Origin(props.adminPwaBucket, {
                        originAccessIdentity: adminPwaOriginAccessIdentity
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                    functionAssociations: [{
                        function: adminRewriteFunction,
                        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    }],
                },
                '/admin/*': {
                    origin: new origins.S3Origin(props.adminPwaBucket, {
                        originAccessIdentity: adminPwaOriginAccessIdentity
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                    functionAssociations: [{
                        function: adminRewriteFunction,
                        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    }],
                },
                '/api/*': {
                    origin: httpApiGatewayOrigin,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                },
            },
            defaultRootObject: 'index.html',
        });
    }
}
