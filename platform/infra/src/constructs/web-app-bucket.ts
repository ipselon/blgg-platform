import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface WebAppBucketConstructProps {
}

export class WebAppBucketConstruct extends Construct {
    public readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props?: WebAppBucketConstructProps) {
        super(scope, id);
        // Create an S3 bucket where the PWA will be stored
        this.bucket = new s3.Bucket(this, 'WebAppBucket', {
            publicReadAccess: false, // It's recommended to keep this false as CloudFront will be used to serve the content
            removalPolicy: cdk.RemovalPolicy.DESTROY, // BE CAREFUL with this in production
            autoDeleteObjects: true, // BE CAREFUL with this in production
        });
    }
}
