#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventbridgeSqsEcsAutoscalingStack } from '../lib/eventbridge-sqs-ecs-autoscaling-stack';
import {config} from '../config'; 

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION
const env = {account, region}; 


new EventbridgeSqsEcsAutoscalingStack(app, 'EventbridgeSqsEcsAutoscalingStack', {

  stackName: `${config.solutionName}-${config.environment}`,
  env,
  ...config
});