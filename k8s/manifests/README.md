# Distributed Tracing with Opentelemetry collector on Kubernetes - Zero to Hero

Starting up with both Kubernetes and opentelemetry could be a challenging task. The purpose of this tutorial is to simplify the process and help a complete beginner understand::

- What is the Opentelemetry Collector.
- How to run the Collector with Docker.
- How to export our traces to Jaeger and to a 3rd party distributed tracing platform.
- How to run the collector locally with Kubernetes as both Gateway and Agent.

## What is Opentelemetry Collector




```bash
brew install minikube
```

```bash
minikube start
```

```bash
minikube dashboard
```

create a namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: otel-k8s-tutorial
```

cerate a collector gateway
