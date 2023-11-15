import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';

export interface EntryPointConstructProps {
    adminHttpApi: apigwv2.HttpApi;
    webAppHttpApi: apigwv2.HttpApi;
    adminPwaBucket: s3.Bucket;
    // websiteBucket: s3.Bucket;
    webAppBucket: s3.Bucket;
}

export class EntryPointConstruct extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: EntryPointConstructProps) {
        super(scope, id);

        // Define the OAIs for CloudFront to access the S3 buckets
        // const websiteOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'WebsiteOAI');
        // props.websiteBucket.grantRead(websiteOriginAccessIdentity);
        const adminPwaOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'AdminPwaOAI');
        props.adminPwaBucket.grantRead(adminPwaOriginAccessIdentity);
        const webAppOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'WebAppOAI');
        props.webAppBucket.grantRead(webAppOriginAccessIdentity);

        const region = cdk.Stack.of(this).region;
        // Define the HTTP Admin API Gateway endpoint as a custom origin
        const adminApiId = props.adminHttpApi.apiId;
        const adminHttpApiGatewayOrigin = new origins.HttpOrigin(`${adminApiId}.execute-api.${region}.amazonaws.com`, {
            // Optionally, configure origin properties like custom headers, SSL protocols, etc.
            // If you have a custom domain name for your CloudFront distribution
            // and you want your application to be aware of this custom domain,
            // you should set the X-Forwarded-Host header to this custom domain name.
            // customHeaders: {
            //     'X-Forwarded-Host': hostValue
            // }
        });
        // Define the HTTP WebApp API Gateway endpoint as a custom origin
        const webAppApiId = props.webAppHttpApi.apiId;
        const webAppHttpApiGatewayOrigin = new origins.HttpOrigin(`${webAppApiId}.execute-api.${region}.amazonaws.com`, {
            // Optionally, configure origin properties like custom headers, SSL protocols, etc.
            // If you have a custom domain name for your CloudFront distribution
            // and you want your application to be aware of this custom domain,
            // you should set the X-Forwarded-Host header to this custom domain name.
            // customHeaders: {
            //     'X-Forwarded-Host': hostValue
            // }
        });

        // Create a cache policy for the WebApp HttpApi
        const webAppApiCachePolicy = new cloudfront.CachePolicy(this, 'WebAppApiApiCachePolicy', {
            minTtl: cdk.Duration.seconds(600),
            defaultTtl: cdk.Duration.seconds(600),
            maxTtl: cdk.Duration.seconds(600),
            cachePolicyName: 'WebAppApiApiCachePolicy',
            comment: 'Cache policy for WebApp HttpApi with 10 minutes TTL',
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
                origin: webAppHttpApiGatewayOrigin,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                cachePolicy: webAppApiCachePolicy,
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
                    origin: adminHttpApiGatewayOrigin,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
                },
                '/static/*': {
                    origin: new origins.S3Origin(props.webAppBucket, {
                        originAccessIdentity: webAppOriginAccessIdentity
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
                },
            }
        });
    }
}
