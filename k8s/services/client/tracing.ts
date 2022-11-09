import * as opentelemetry from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const otelColEndpoint =
  process.env.OTEL_COL_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

console.log(`Exporting to traces to ${otelColEndpoint}`);

const exporter = new OTLPTraceExporter({
  url: otelColEndpoint,
});

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.SERVICE_NAME,
});

sdk.start();

console.log(`${process.env.SERVICE_NAME}: Start Tracing...`);
