const opentelemetry = require("@opentelemetry/sdk-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { AWSXRayPropagator } = require("@opentelemetry/propagator-aws-xray")
const { AWSXRayIdGenerator } = require("@opentelemetry/id-generator-aws-xray")

const exporter = new OTLPTraceExporter({
    url: 'https://otelcol.aspecto.io/v1/traces',
    headers: {
        // Aspecto API-Key is required
        Authorization: process.env.ASPECTO_API_KEY
    }
})

const sdk = new opentelemetry.NodeSDK({
    spanProcessor: new SimpleSpanProcessor(exporter),
    serviceName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    instrumentations: [
        new getNodeAutoInstrumentations(),
    ],
    textMapPropagator: new AWSXRayPropagator()
});

const tracerConfig = {
    idGenerator: new AWSXRayIdGenerator(),
    // any instrumentations can be declared here
    instrumentations: [
        new getNodeAutoInstrumentations(),
    ],
}

sdk.configureTracerProvider(tracerConfig, new SimpleSpanProcessor(exporter), undefined, new AWSXRayPropagator());
sdk.start()