const opentelemetry = require("@opentelemetry/sdk-node");
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");

const exporter = new opentelemetry.tracing.ConsoleSpanExporter()

const sdk = new opentelemetry.NodeSDK({
    spanProcessor: new SimpleSpanProcessor(exporter),
    instrumentations: [
        new AmqplibInstrumentation(),
        new HttpInstrumentation(),
        new ExpressInstrumentation()
    ],
    serviceName: process.env.SERVICE
});

sdk.start()