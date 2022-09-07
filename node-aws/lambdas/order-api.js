require("tracing.js");
const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const dynamo = new AWS.DynamoDB.DocumentClient();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


exports.handler = async (event, context) => {
  console.info("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))
  console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
  let body;
  let statusCode = 200;
  const routeKey = `${event.httpMethod} ${event.resource}`
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (routeKey) {
      case "DELETE /items/{id}":
        await dynamo
          .delete({
            TableName: process.env.DDB_TABLE_NAME,
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        body = await dynamo
          .get({
            TableName: process.env.DDB_TABLE_NAME,
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /items":
        body = await dynamo.scan({ TableName: process.env.DDB_TABLE_NAME }).promise();
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo.put({
          TableName: process.env.DDB_TABLE_NAME,
          Item: {
            id: requestJSON.id,
            price: requestJSON.price,
            name: requestJSON.name,
            status: "processing"
          }
        }).promise();
        const params = {
          MessageBody: JSON.stringify({ id: requestJSON.id }),
          QueueUrl: process.env.SQS_URL,
        }
        await sqs.sendMessage(params).promise();
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  await sleep(2000);
  return {
    statusCode,
    body,
    headers
  };
};
