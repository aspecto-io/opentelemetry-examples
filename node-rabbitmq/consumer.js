const amqplib = require('amqplib');

let rabbitConnection;
let exchange = 'logs'

const rabbitMqListenToMessages = async (callback) => {
    if (!rabbitConnection) {
        rabbitConnection = await amqplib.connect('amqp://localhost');
    }
    const channel = await rabbitConnection.createChannel();
    await channel.assertExchange(exchange, 'fanout')
    const q = await channel.assertQueue('');
    await channel.bindQueue(q.queue, exchange, '');
    await channel.consume('', (message) => callback(message.content.toString()), { noAck: true })
}
rabbitMqListenToMessages((message) => console.log(`Consumer recieved message: ${message}`))
console.log(`${process.env.SERVICE} Running`)