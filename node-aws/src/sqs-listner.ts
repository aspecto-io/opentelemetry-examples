import { DynamoDB } from "aws-sdk";
import { UpdateItemInput } from "aws-sdk/clients/dynamodb";
// import { DeleteMessageRequest, ReceiveMessageRequest } from "aws-sdk/clients/sqs";
import { Consumer } from "sqs-consumer";

// const sqs = new SQS({ region: process.env.AWS_REGION as string });
const dynamo = new DynamoDB.DocumentClient({ region: process.env.AWS_REGION as string });

const app = Consumer.create({
    queueUrl: process.env.SQS_URL as string,
    handleMessage: async (message) => {
        if (message.Body) {
            const parsedBody = JSON.parse(message.Body);
            // do some processing and then change status to complete
            await dynamoUpdateCompleted(parsedBody.id);
        }
    }
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

app.start();

// function wait(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

async function dynamoUpdateCompleted(id: string) {
    const params: UpdateItemInput = {
        TableName: process.env.DDB_TABLE_NAME as string,
        Key: {
            // @ts-ignore
            id
        },
        ExpressionAttributeNames: {
            "#S": "status"
        },

        // This expression is what updates the item attribute 
        ExpressionAttributeValues: {
            ":s": { S: "complete" }
        },
        UpdateExpression: "SET #S = :s",
        ReturnValues: "ALL_NEW",
    };
    await dynamo.update(params).promise()
}

// async function SQSReceiveMessage(): Promise<string | undefined> {
//     const queueURL = process.env.SQS_URL as string
//     const params: ReceiveMessageRequest = {
//         AttributeNames: ["SentTimestamp"],
//         MaxNumberOfMessages: 10,
//         MessageAttributeNames: ["All"],
//         QueueUrl: queueURL,
//         VisibilityTimeout: 20,
//         WaitTimeSeconds: 0,
//     };
//     const data = await sqs.receiveMessage(params).promise();
//     if (data && data.Messages) {
//         console.log(data.Messages[0].Body!);
//         const deleteParams: DeleteMessageRequest = {
//             QueueUrl: queueURL,
//             ReceiptHandle: data.Messages[0].ReceiptHandle!,
//         };
//         await sqs.deleteMessage(deleteParams).promise();
//         console.log("Message deleted");
//         return data.Messages[0].Body
//     } else {
//         console.log("No messages to delete");
//     }
// }

// async function main() {
//     try {
//         const message = await SQSReceiveMessage();
        // if (message) {
        //     const parsedBody = JSON.parse(message);
        //     // do some processing and then change status to complete
        //     await dynamoUpdateCompleted(parsedBody.id);
        // }
//     } catch (err: any) {
//         console.log(err.message);
//     }
//     await wait(2000)
// }

// (async () => await main())()