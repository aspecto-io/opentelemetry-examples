import { DynamoDB } from "aws-sdk";
import { UpdateItemInput } from "aws-sdk/clients/dynamodb";
import { Consumer } from "sqs-consumer";

const dynamo = new DynamoDB.DocumentClient({ region: process.env.AWS_REGION as string });
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