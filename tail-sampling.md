# Tail Collector

Otelcol tail sampling consists of two layers of collectors. The first one acts as a traceId aware load balancer, ensuring that all spans with the same traceId are collected by the same sampling collector. 
The second layer receives the spans and waits for a configurable amount of time before making the sampling decision.
In general, you should set the wait_time to be longer than the longest flow in your application.

### otelcol-loadbalancing
The images are hosted in a public ECR repository
`public.ecr.aws/x3s3n8k7/otelcol-loadbalancing:latest`

To enable load balancing to find the sampling collector, you must provide a DNS name that resolves to a list of IP addresses for your containers. If you have a fixed number of instances you can provide the load balancing otelcol with a static list of IPs.

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:

exporters:
  loadbalancing:
    protocol:
      otlp:
        timeout: 1s
        tls:
          insecure: true
    resolver:
      dns:
        hostname: ${OTELCOL_SAMPLING_DNS_HOSTNAME}
        port: 4317

extensions:
  health_check:
    endpoint: "0.0.0.0:8090"
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: 
    - zpages
    - health_check
  pipelines:
    traces:
      receivers:
        - otlp
      processors: 
        - batch
      exporters: 
        - loadbalancing
```

### otelcol-sampling
The images are hosted in a public ECR repository
`public.ecr.aws/x3s3n8k7/otelcol-sampling:latest`

Below is an example of the configuration file to provide the collector with
Make sure to set `ASPECTO_TOKEN` environment variable with a your aspecto token that can be found [here](https://app.aspecto.io/integration/tokens)

```
config_sources:
  aspecto:
    token: ${ASPECTO_TOKEN}
    interval: 10

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  tail_sampling: $$aspecto:tail_sampling
  resource:
    attributes:
      - key: aspecto.customer.prem
        value: true
        action: insert
  batch:

exporters:
  otlp:
    endpoint: https://collector.aspecto.io:4317
    sending_queue:
      enabled: true
      queue_size: 10000
      num_consumers: 20

extensions:
  health_check:
    endpoint: "0.0.0.0:8090"
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions:
   - zpages
   - health_check
  pipelines:
    traces:
      receivers: 
        - otlp
      processors: 
        - tail_sampling
        - resource
        - batch
      exporters: 
        - otlp
```

