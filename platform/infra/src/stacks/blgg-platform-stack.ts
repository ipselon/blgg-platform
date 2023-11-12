import * as cdk from 'aws-cdk-lib';
import {Stack} from 'aws-cdk-lib/core';
import {Construct} from 'constructs';
import {AdminApiConstruct} from '../constructs/admin-api';
import {AdminPwaBucketConstruct} from '../constructs/admin-pwa-bucket';
import {WebsiteBucketConstruct} from '../constructs/website-bucket';
import {EntryPointConstruct} from '../constructs/entry-point';
import {WebsiteDeploymentConstruct} from '../constructs/website-deployment';
import {AdminPwaDeploymentConstruct} from '../constructs/admin-pwa-deployment';

export interface BlggPlatformStackProps {

}

export class BlggPlatformStack extends Stack {
    constructor(scope: Construct, id: string, props?: BlggPlatformStackProps) {
        super(scope, id, props);
        const adminApiConstruct = new AdminApiConstruct(this, 'AdminApiConstruct', {});

        const adminPwaBucketConstruct = new AdminPwaBucketConstruct(this, 'AdminPwaBucketConstruct');
        const websiteBucketConstruct = new WebsiteBucketConstruct(this, 'WebsiteBucketConstruct');

        const entryPointConstruct = new EntryPointConstruct(this, 'EntryPointConstruct', {
            adminPwaBucket: adminPwaBucketConstruct.bucket,
            websiteBucket: websiteBucketConstruct.bucket,
            adminHttpApi: adminApiConstruct.httpApi
        });

        new WebsiteDeploymentConstruct(this, 'WebsiteDeploymentConstruct', {
            entryPointDistribution: entryPointConstruct.distribution,
            websiteBucket: websiteBucketConstruct.bucket
        });

        new AdminPwaDeploymentConstruct(this, 'AdminPwaDeploymentConstruct', {
            entryPointDistribution: entryPointConstruct.distribution,
            adminPwaBucket: adminPwaBucketConstruct.bucket
        });

        // Output the distribution domain name so it can be easily accessed
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: entryPointConstruct.distribution.distributionDomainName,
        });
    }
}
