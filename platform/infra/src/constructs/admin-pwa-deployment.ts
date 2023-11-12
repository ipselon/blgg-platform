import { resolve } from "node:path";
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface AdminPwaConstructProps {
    adminPwaBucket: s3.Bucket;
    entryPointDistribution: cloudfront.Distribution
}

export class AdminPwaDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string, props: AdminPwaConstructProps) {
        super(scope, id);
        console.log('Admin PWA Path: ', resolve('../admin-pwa/dist'));
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'AdminPwaDeployment', {
            sources: [s3deploy.Source.asset(resolve('../admin-pwa/dist'))],
            destinationBucket: props.adminPwaBucket,
            distribution: props.entryPointDistribution,
            destinationKeyPrefix: 'admin', // Deploy contents to /admin directory in the bucket
            distributionPaths: ['/admin/*'], // Invalidate the CloudFront cache
        });
    }
}
