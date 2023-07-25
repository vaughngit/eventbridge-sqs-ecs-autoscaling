import boto3
import os
import json

sqs = boto3.client('sqs');
ses = boto3.client('ses'); 
queue_url = os.environ['queueUrl'];

def read_sqs():
    print(f"Reading queue- {queue_url}")
    response = sqs.receive_message(
        QueueUrl=queue_url,
        AttributeNames=[
            'SentTimestamp'
        ],
        MaxNumberOfMessages=1,
        MessageAttributeNames=[
            'All'
        ],
        VisibilityTimeout=0,
        WaitTimeSeconds=0
    )
    key_to_lookup = 'Messages'
    if key_to_lookup in response:
        return response['Messages']
    else:
        print(f"The queue is empty")
        return None


def delete_sqs_message(receipt_handle):
    print(f"Deleting message {receipt_handle}")
    # Delete received message from queue
    sqs.delete_message(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle
    )

def send_email(sender_email, recipient_email, subject, body):
    response = ses.send_email(
        Source=sender_email,
        Destination={
            'ToAddresses': [recipient_email]
        },
        Message={
            'Subject': {
                'Data': subject
            },
            'Body': {
                'Text': {
                    'Data': body
                }
            }
        }
    )
    return response

# Read SQS
messages = read_sqs()
print(f"Found messages {messages}")
#size = len(inp_lst)
# if messages is None: 
#     print("No messages in the queue")   
# else:
#     for message in messages:
#     # Take custom actions based on the message contents
#         print(f"Activating {message}")
#         print(f"Hello")

#         # Delete Message 
#         delete_sqs_message(message['ReceiptHandle'])
#         print(f"Finished for {message}")
#         # After deleting the SQS message
if messages is None: 
    print("No messages in the queue")   
else:
    for message in messages:
        print(f"Activating {message}")
        print(f"Emailing Contents of message")

        # Delete Message 
        delete_sqs_message(message['ReceiptHandle'])

        # Extract the message content from the object
        message_content = message['Body']
        message_detail = json.loads(message_content)
        message_body = message_detail['detail']['body']
        sender_email = message_detail['detail']['sender']
        recipient_email = message_detail['detail']['recipient']
        message_subject = message_detail['detail']['subject']

        print(f"Message Subject: {message_subject}")
        print(f"Message Body: {message_body}")

        # Send email using Amazon SES
        #sender_email = 'awsalvin@amazon.com'
        #recipient_email = 'awsalvin@amazon.com'
        #subject = 'Test SQS to SES'
        #body = message_content  # Set the body of the email to the message_content

        response = send_email(sender_email, recipient_email, message_subject, message_body)
        print(f"Email sent. Message ID: {response['MessageId']}")

        print(f"Finished for {message}")
       