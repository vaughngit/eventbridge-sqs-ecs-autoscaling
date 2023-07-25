import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SqSConstruct } from './constructs/sqs-construct';
import { EventBridgeConstruct } from './constructs/eventbridge-construct';
import {EcsConstruct} from './constructs/ecs-construct'


export interface IStackProps extends StackProps{
  environment: string; 
  costcenter: string; 
  solutionName: string; 
 // init: boolean; 
}


export class EventbridgeSqsEcsAutoscalingStack extends Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props);

    const {queue} = new SqSConstruct(this, "createSQSQueue", props)
    new EventBridgeConstruct(this, "createEventBridge", {...props, queue })

    new EcsConstruct(this, 'createEcsAutoscaler', {queue, ...props})
  }
}
