# Opentelemetry collector on Kubernetes Zero to Hero

In this tutorial im going to demonstrate how to begin working with the opentlemetry collector.
We will start by simply running the opentelemetry collector with docker, exporting the traces to a local instance of

## Running the collector with docker



```yaml
# otelcol-config.yml
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  otlp/aspecto:
    endpoint: otelcol.aspecto.io:4317
    headers:
      Authorization: a311563e-8ece-467c-97dc-6276ef3a7b14

  logging:

  jaeger:
    endpoint: jaeger-all-in-one:14250
    tls:
      insecure: true

processors:
  batch:

extensions:
  health_check:
  zpages:
    endpoint: :55679

service:
  extensions: [zpages, health_check]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging, jaeger, otlp/aspecto]
```

Docker Compose file

```