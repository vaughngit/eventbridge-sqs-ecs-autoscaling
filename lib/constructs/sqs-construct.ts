import { Construct } from 'constructs';
import { CfnOutput, Duration, StackProps, Tags } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';


interface ConstructProps extends StackProps {
  environment: string; 
  costcenter: string; 
  solutionName: string; 
}

export class SqSConstruct extends Construct{
  public queue: Queue
  
  constructor(scope: Construct, id: string, props: ConstructProps) {
    super(scope, id);

        //Create Queue
        const queue = new Queue(this, 'TheQueue', {
          visibilityTimeout: Duration.seconds(300)
        });
    

      this.queue = queue
        
      new CfnOutput(this, "QueueURL", {
        "description": "URL of SQS Queue",
        "value": queue.queueUrl
      });


      
    Tags.of(this).add('Solution', props.solutionName);
    Tags.of(this).add('CostCenter', props.costcenter);   
    Tags.of(this).add("environment", props.environment)
  }
}
