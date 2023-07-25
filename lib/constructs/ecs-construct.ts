import { Construct } from 'constructs';
import { CfnOutput, Duration, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { IQueue, Queue } from 'aws-cdk-lib/aws-sqs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { AwsLogDriver, Cluster, ContainerImage, FargateService, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { AdjustmentType } from 'aws-cdk-lib/aws-applicationautoscaling';


interface ConstructProps {
    queue: IQueue
    environment: string; 
    costcenter: string; 
    solutionName: string; 
}


export class EcsConstruct extends Construct{
  public queue: Queue
  
  constructor(scope: Construct, id: string, props: ConstructProps) {
    super(scope, id);
    const { region, account }  = Stack.of(this)

    /*     //Create ECS cluster
    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType("t3.nano"),
    });

    const vpc = new ec2.Vpc(this, "FargateVPC", {
      natGatewayProvider,
      natGateways: 1,
    });
 */
    const vpc = Vpc.fromLookup(this, "default", {
        isDefault: true 
    })

    //Create ECS Cluster 
    const cluster = new Cluster(this, "Cluster", { vpc });
   

    //task execution role ― is a general role that grants permissions to start the containers defined in a task. 
   //Those permissions are granted to the ECS agent so it can call AWS APIs on your behalf.
   const generalExecutionRole = new Role(this, `General-Task-ExecutionRole`, {
    roleName: `ECS-Task-ExecutionRole`,
    description: "A general role that grants permissions to start the containers defined in a task.",
    assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
      ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"),
      ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"),
      ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy")
    ]
  });
    
    // Create a task role that will be used within the container
    const EcsTaskRole = new Role(this, "EcsTaskRole", {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    EcsTaskRole.attachInlinePolicy(
      new Policy(this, "SQSAdminAccess", {
        statements: [
          new PolicyStatement({
            actions: ["sqs:*"],
            effect: Effect.ALLOW,
            resources: [props.queue.queueArn],
          }),
        ],
      })
    );    

    EcsTaskRole.attachInlinePolicy(
      new Policy(this, "SESAdminAccess", {
        statements: [
          new PolicyStatement({
            actions: ["ses:*"],
            effect: Effect.ALLOW,
            resources: ["*"],
          }),
        ],
      })
    );  

    // Create task definition
    const fargateTaskDefinition = new FargateTaskDefinition( this,  "FargateTaskDef",
      {
        memoryLimitMiB: 4096,
        cpu: 2048,
        taskRole: EcsTaskRole,
        executionRole: generalExecutionRole 
      },
    
    );

    // create a task definition with CloudWatch Logs
    const logging = new AwsLogDriver({
      streamPrefix: "mailapp",
    });

    // Create container from local `Dockerfile`
    const appContainer = fargateTaskDefinition.addContainer("Container", {
      image: ContainerImage.fromAsset("../../python-sqs-app"), 
      environment: {
          queueUrl: props.queue.queueUrl,
          region: region,
        },
      logging,
    });

    // Create service
    const service = new FargateService(this, "Service", {
      cluster,
      taskDefinition: fargateTaskDefinition,
      desiredCount: 0,
      assignPublicIp: true
    });
    
    // Configure task auto-scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 0,
      maxCapacity: 1,
    });

    // Setup scaling metric and cooldown period
    scaling.scaleOnMetric("QueueMessagesVisibleScaling", {
      metric: props.queue.metricApproximateNumberOfMessagesVisible(),
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.seconds(300),
      scalingSteps: [
        { upper: 0, change: -1 },
        { lower: 1, change: +1 },
      ],
    });
    

      
    Tags.of(this).add('Solution', props.solutionName);
    Tags.of(this).add('CostCenter', props.costcenter);   
    Tags.of(this).add("environment", props.environment)
  }
}
