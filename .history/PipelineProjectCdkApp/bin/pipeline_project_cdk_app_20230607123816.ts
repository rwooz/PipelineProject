#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineProjectCdkAppStack } from '../lib/pipeline_project_cdk_app-stack';

const app = new cdk.App();
new PipelineProjectCdkAppStack(app, 'PipelineProjectCdkAppStack', {
  env: {
    account: '203069254505',
    region: 'us-east-1',
  }
});

app.synth(); // Might not be needed