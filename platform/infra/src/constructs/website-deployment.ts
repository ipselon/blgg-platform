import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface WebsiteConstructProps {
    websiteBucket: s3.Bucket;
    entryPointDistribution: cloudfront.Distribution;
}

export class WebsiteDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string, props: WebsiteConstructProps) {
        super(scope, id);
        console.log('Website Path: ', resolve('../../website/dist'));
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
            sources: [s3deploy.Source.asset(resolve('../../website/dist'))],
            destinationBucket: props.websiteBucket,
            distribution: props.entryPointDistribution,
            // todo: do we need to invalidate cache excluding /api/* and /admin/*?
            // distributionPaths: ['/*'], // Invalidate the CloudFront cache
        });
    }
}
