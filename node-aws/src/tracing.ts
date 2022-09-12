import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const exporter = new OTLPTraceExporter({
    url: 'https://otelcol.aspecto.io/v1/traces',
    headers: {
        // Aspecto API-Key is required
        Authorization: process.env.ASPECTO_API_KEY
    }
})

const sdk = new NodeSDK({
    spanProcessor: new BatchSpanProcessor(exporter),
    serviceName: process.env.SERVICE_NAME || process.env.AWS_LAMBDA_FUNCTION_NAME,
    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-aws-lambda": {
                disableAwsContextPropagation: true
            }
        })
    ]
});

sdk.start()