import * as cdk from 'aws-cdk-lib';
import {Stack} from 'aws-cdk-lib/core';
import {Construct} from 'constructs';
import {AdminApiConstruct} from '../constructs/admin-api';
import {AdminPwaBucketConstruct} from '../constructs/admin-pwa-bucket';
// import {WebsiteBucketConstruct} from '../constructs/website-bucket';
import {EntryPointConstruct} from '../constructs/entry-point';
// import {WebsiteDeploymentConstruct} from '../constructs/website-deployment';
import {AdminPwaDeploymentConstruct} from '../constructs/admin-pwa-deployment';
import {DynamoDbTablesConstruct} from '../constructs/dynamo-db-tables';
import {WebAppBucketConstruct} from '../constructs/web-app-bucket';
import {WebAppApiConstruct} from '../constructs/web-app-api';
import {WebAppDeploymentConstruct} from '../constructs/web-app-deployment';

export interface BlggPlatformStackProps {

}

export class BlggPlatformStack extends Stack {
    constructor(scope: Construct, id: string, props?: BlggPlatformStackProps) {
        super(scope, id, props);
        const dynamoDbTablesConstruct = new DynamoDbTablesConstruct(this, 'DynamoDbTablesConstruct');
        const adminApiConstruct = new AdminApiConstruct(this, 'AdminApiConstruct', {
            probeTable: dynamoDbTablesConstruct.table
        });
        const webAppApiConstruct = new WebAppApiConstruct(this, 'WebAppApiConstruct', {
            probeTable: dynamoDbTablesConstruct.table
        });

        const adminPwaBucketConstruct = new AdminPwaBucketConstruct(this, 'AdminPwaBucketConstruct');
        // const websiteBucketConstruct = new WebsiteBucketConstruct(this, 'WebsiteBucketConstruct');
        const webAppBucketConstruct = new WebAppBucketConstruct(this, 'WebAppBucketConstruct');

        const entryPointConstruct = new EntryPointConstruct(this, 'EntryPointConstruct', {
            adminPwaBucket: adminPwaBucketConstruct.bucket,
            webAppBucket: webAppBucketConstruct.bucket,
            // websiteBucket: websiteBucketConstruct.bucket,
            adminHttpApi: adminApiConstruct.httpApi,
            webAppHttpApi: webAppApiConstruct.httpApi
        });

        // new WebsiteDeploymentConstruct(this, 'WebsiteDeploymentConstruct', {
        //     entryPointDistribution: entryPointConstruct.distribution,
        //     websiteBucket: websiteBucketConstruct.bucket
        // });

        new AdminPwaDeploymentConstruct(this, 'AdminPwaDeploymentConstruct', {
            entryPointDistribution: entryPointConstruct.distribution,
            adminPwaBucket: adminPwaBucketConstruct.bucket
        });

        new WebAppDeploymentConstruct(this, 'WebAppDeploymentConstruct', {
            entryPointDistribution: entryPointConstruct.distribution,
            webAppBucket: webAppBucketConstruct.bucket
        });

        // Output the distribution domain name so it can be easily accessed
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: entryPointConstruct.distribution.distributionDomainName,
        });
    }
}
