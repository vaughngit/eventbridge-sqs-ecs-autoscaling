import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import { CfnOutput, StackProps } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as targets from 'aws-cdk-lib/aws-events-targets';

interface ConstructProps {
    queue: sqs.Queue
    environment: string; 
    costcenter: string; 
    solutionName: string; 
}

export class EventBridgeConstruct extends Construct{
  constructor(scope: Construct, id: string, props: ConstructProps) {
    super(scope, id);

    //Create Event bus and rule
    var custom_bus = new events.EventBus(this, "bus", {
        "eventBusName": "test-bus-cdk"
      });
      const rule = new events.Rule(this, "rule", {
        "eventBus": custom_bus
      });
      rule.addEventPattern({
        "source": ["eb-sqs-ecs"],
        "detailType": ["message-for-queue"]
      });
      rule.addTarget(new targets.SqsQueue(props.queue));
      
      new CfnOutput(this, "QueueURL", {
        "description": "URL of SQS Queue",
        "value": props.queue.queueUrl
      });
  }
}
