import * as cdk from 'aws-cdk-lib';
import { CfnKeyPair, IpAddresses, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset, NetworkMode } from 'aws-cdk-lib/aws-ecr-assets';
import { CodePipeline, ShellStep, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import path = require('path');
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PipelineProjectCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Key Pair for ECS
    const pipelineKeyPair = new CfnKeyPair(this, 'SamplePipelineKeyPair', {
      keyName: 'SamplePipeline'
    });

    // Create VPC for ECS
    const pipelineVpc = new Vpc(this, 'SamplePipelineVpc', {
      vpcName: 'SamplePipeline',
      ipAddresses: IpAddresses.cidr('10.0.0.0/16')
    });

    // Create Security Group for ECS
    const pipelineSecurityGroup = new SecurityGroup(this, 'SamplePipelineSecurityGroup', {
      vpc: pipelineVpc,
      description: 'Security group for Sample Pipeline Project. Manages ECS connections.',
      securityGroupName: 'SamplePipeline'
    });

    // Create ECR for Docker Image
    const pipelineEcr = new Repository(this, 'SamplePipelineEcr', {
      autoDeleteImages: true,
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      repositoryName: 'SamplePipeline'
    });

    // Import Dockerfile
    const pipelineAsset = new DockerImageAsset(this, 'SamplePipelineBuildImage', {
      directory: path.join(__dirname, 'Dockerfile'),
      networkMode: NetworkMode.DEFAULT // May want to change to HOST
    });

    // Point imported Dockerfile to ECR
    const pipelineDockerImage: cdk.DockerImageAssetLocation = {
      imageUri: pipelineAsset.imageUri,
      repositoryName: pipelineEcr.repositoryName,
      imageTag: 'SamplePipeline'
    };

    // Create Pipeline
    const pipelinePipeline = new CodePipeline(this, 'SamplePipelinePipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('my-org/my-app', 'main', {
          connectionArn: 'arn:aws:codestar-connections:us-east-1:222222222222:connection/7d2469ff-514a-4e4f-9003-5ca4a43cdc41', // Created using the AWS console
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });
  }
}
