import { trace } from '@opentelemetry/api';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const otelColEndpoint =
  process.env.OTEL_COL_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

console.log(`Exporting to traces to ${otelColEndpoint}`);

const exporter = new OTLPTraceExporter({
  url: otelColEndpoint,
});

const sdk = new opentelemetry.NodeSDK({
  spanProcessor: new SimpleSpanProcessor(exporter),
  serviceName: process.env.SERVICE_NAME,
});

sdk.start();
console.log(`${process.env.SERVICE_NAME}: Start Tracing...`);

let spanCounter = 0;
setInterval(() => {
  trace.getTracer('My Tracer').startSpan('Span number: #' + spanCounter++).end();
}, 5000);
