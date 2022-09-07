require("tracing.js");
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async (event, context) => {
    console.info("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
    console.info("EVENT\n" + JSON.stringify(event, null, 2))
    console.info("CONTEXT\n" + JSON.stringify(context, null, 2))
    for (record of event.Records) {
        const { body } = record;
        // do some processing and then change status to complete
        const parsedBody = JSON.parse(body);
        const params = {
            TableName: process.env.DDB_TABLE_NAME,
            // this is your DynamoDB Table 
            Key: {
                id: parsedBody.id,
                //find the itemId in the table that you pull from the event 
            },
            ExpressionAttributeNames: {
                "#S": "status"
            },

            // This expression is what updates the item attribute 
            ExpressionAttributeValues: {
                ":s": "complete"
            },
            UpdateExpression: "SET #S = :s",
            ReturnValues: "ALL_NEW",
        };
        await dynamo.update(params).promise()
    }
    await sleep(2000)
    return {};
}