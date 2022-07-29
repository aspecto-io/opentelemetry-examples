const opentelemetry = require("@opentelemetry/sdk-node");
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");

const exporter = new OTLPTraceExporter({
    url: 'https://otelcol.aspecto.io/v1/traces',
    headers: {
        // Aspecto API-Key is required
        Authorization: process.env.ASPECTO_API_KEY
    }
})

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