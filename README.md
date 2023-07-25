# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template




## Demoing App: 

Send custom events to Amazon EventBridge so that they can be matched to rules using put-events command

For an example, an event in event.json file is as follows- 
[
    {
      "EventBusName": "test-bus-cdk",
      "Source": "eb-sqs-ecs",
      "DetailType": "message-for-queue",
      "Detail": "{\"message\":\"Hello CDK world!\"}"
    }
  ]

### Start here: 

- `python .\event_converter.py` 

Execute the following command to put event on EventBridge-


- `aws events put-events --entries file://event.json --profile demo` 



After execution, you see output similar to following in the command line-
{
    "FailedEntryCount": 0,
    "Entries": [
        {
            "EventId": "<Event ID created>"
        }
    ]
}

In the AWS Management Console, you’ll notice a new EventBridge event bus, a SQS queue, an ECS cluster and a task. You can monitor CloudWatch logs and notice the log for queue reading, messages read and deleted messages.  


