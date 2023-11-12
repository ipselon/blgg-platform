#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BlggPlatformStack } from '../src/stacks/blgg-platform-stack';

const app = new cdk.App();
new BlggPlatformStack(app, 'BlggPlatformStack');
