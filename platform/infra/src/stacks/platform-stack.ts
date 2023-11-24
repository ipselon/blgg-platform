import * as cdk from 'aws-cdk-lib';
import {Stack} from 'aws-cdk-lib/core';
import {Construct} from 'constructs';
import {AdminApiConstruct} from '../constructs/admin-api';
import {EntryPointConstruct} from '../constructs/entry-point';
import {DynamoDbTablesConstruct} from '../constructs/dynamo-db-tables';
import {WebAppApiConstruct} from '../constructs/web-app-api';
import {SystemBucketConstruct} from '../constructs/system-bucket';
import {PreviewPointConstruct} from '../constructs/preview-point';
import {SystemBucketDeploymentConstruct} from '../constructs/system-bucket-deployment';

export interface PlatformStackProps {

}

export class PlatformStack extends Stack {
    constructor(scope: Construct, id: string, props?: PlatformStackProps) {
        super(scope, id, props);
        const dynamoDbTablesConstruct = new DynamoDbTablesConstruct(this, 'DynamoDbTablesConstruct');
        const adminApiConstruct = new AdminApiConstruct(this, 'AdminApiConstruct', {
            tables: dynamoDbTablesConstruct.tables
        });
        const webAppApiConstruct = new WebAppApiConstruct(this, 'WebAppApiConstruct', {
            tables: dynamoDbTablesConstruct.tables
        });

        const systemBucketConstruct = new SystemBucketConstruct(this, 'SystemBucketConstruct');

        const entryPointConstruct = new EntryPointConstruct(this, 'EntryPointConstruct', {
            systemBucket: systemBucketConstruct.bucket,
            systemBucketOAI: systemBucketConstruct.bucketOAI,
            adminHttpApiGatewayOrigin: adminApiConstruct.httpApiGatewayOrigin,
            webAppHttpApiGatewayOrigin: webAppApiConstruct.httpApiGatewayOrigin
        });

        const previewPointConstruct = new PreviewPointConstruct(this, 'PreviewPointConstruct', {
            systemBucket: systemBucketConstruct.bucket,
            systemBucketOAI: systemBucketConstruct.bucketOAI,
            webAppHttpApiGatewayOrigin: webAppApiConstruct.httpApiGatewayOrigin
        });

        new SystemBucketDeploymentConstruct(this, 'SystemBucketDeploymentConstruct', {
            entryPointDistribution: entryPointConstruct.distribution,
            previewPointDistribution: previewPointConstruct.distribution,
            systemBucket: systemBucketConstruct.bucket
        });

        // Output the distribution domain name so it can be easily accessed
        new cdk.CfnOutput(this, 'EntryPointDomainName', {
            value: entryPointConstruct.distribution.distributionDomainName,
        });
        // Output the distribution domain name so it can be easily accessed
        new cdk.CfnOutput(this, 'PreviewPointDomainName', {
            value: previewPointConstruct.distribution.distributionDomainName,
        });
    }
}
