import { SQS, DynamoDB } from "aws-sdk";
import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SendMessageRequest } from "aws-sdk/clients/sqs";
const sqs = new SQS();
const dynamo = new DynamoDB.DocumentClient();

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    let body; ``
    let statusCode = 200;
    const routeKey = `${event.httpMethod} ${event.resource}`
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        const tableName = process.env.DDB_TABLE_NAME as string
        const sqsUrl = process.env.SQS_URL as string
        if (!tableName) {
            return { statusCode: 500, body: 'Missing environment variable DDB_TABLE_NAME', headers }
        }
        if (!sqsUrl) {
            return { statusCode: 500, body: 'Missing environment variable SQS_URL', headers }
        }
        const id = event.pathParameters?.id
        switch (routeKey) {
            case "DELETE /items/{id}":
                await dynamo
                    .delete({
                        TableName: tableName,
                        Key: {
                            id
                        }
                    })
                    .promise();
                body = `Deleted item ${id}`;
                break;
            case "GET /items/{id}":
                body = await dynamo
                    .get({
                        TableName: tableName,
                        Key: {
                            id
                        }
                    })
                    .promise();
                break;
            case "GET /items":
                body = await dynamo.scan({ TableName: tableName }).promise();
                break;
            case "PUT /items":
                let requestJSON = JSON.parse(event.body as string);
                await dynamo.put({
                    TableName: tableName,
                    Item: {
                        id: requestJSON.id,
                        price: requestJSON.price,
                        name: requestJSON.name,
                        status: "processing"
                    }
                }).promise();
                const params: SendMessageRequest = {
                    MessageBody: JSON.stringify({ id: requestJSON.id }),
                    QueueUrl: sqsUrl,
                }
                await sqs.sendMessage(params).promise();
                body = `Put item ${requestJSON.id}`;
                break;
            default:
                throw new Error(`Unsupported route: "${routeKey}"`);
        }
    } catch (err: any) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }
    await wait(2000);
    return {
        statusCode,
        body,
        headers
    };
};


module.exports = { handler }