const amqplib = require('amqplib');
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

let rabbitConnection;
let exchange = 'logs'

amqplib.connect('amqp://localhost').then(connection => rabbitConnection = connection);

const sendRabbitMqMessage = async (message) => {
  const channel = await rabbitConnection.createChannel();
  await channel.assertExchange(exchange , 'fanout')
  await channel.publish(exchange, '', Buffer.from(message))
}

app.get('/', async (req, res) => {
  const message = 'Hello World!'
  console.log(`Send message: '${message}'`);
  await sendRabbitMqMessage(message);
  res.send(message)
})

app.listen(port, () => {
  console.log(`${process.env.SERVICE} Running`)
})
