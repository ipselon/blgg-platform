import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface WebAppDeploymentConstructProps {
    webAppBucket: s3.Bucket;
    entryPointDistribution: cloudfront.Distribution
}

export class WebAppDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string, props: WebAppDeploymentConstructProps) {
        super(scope, id);
        console.log('WebApp Assets Path: ', resolve('../web-app/static'));
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'WebAppBucketDeployment', {
            sources: [s3deploy.Source.asset(resolve('../web-app/static'))],
            destinationBucket: props.webAppBucket,
            distribution: props.entryPointDistribution,
            destinationKeyPrefix: 'static', // Deploy contents to /admin directory in the bucket
            distributionPaths: ['/static/*'], // Invalidate the CloudFront cache
        });
    }
}
