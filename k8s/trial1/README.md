# Kubernetes opentelemetry tutorial

```bash
brew install kind
```

```bash
kind create cluster
✓ Ensuring node image (kindest/node:v1.25.2) 🖼
✓ Preparing nodes 📦  
✓ Writing configuration 📜
✓ Starting control-plane 🕹️
✓ Installing CNI 🔌
✓ Installing StorageClass 💾
```

```bash
kubectl cluster-info --context kind-kind

Kubernetes control plane is running at https://127.0.0.1:54615
CoreDNS is running at https://127.0.0.1:54615/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts

"open-telemetry" has been added to your repositories
```

```bash
helm install my-opentelemetry-collector open-telemetry/opentelemetry-collector
```

Need to define mode. Created collector-values.yml

```bash
helm install collectron open-telemetry/opentelemetry-collector --values collector-values.yaml

[WARNING] 'logsCollection' "k8s.container.name", "k8s.namespace.name", "k8s.pod.name", "k8s.container.restart_count", "k8s.pod.uid" log-level attributes are promoted to resource-level attributes. Once Collector version 0.62.0 is released we will remove the log-level attributes. If you need log-level attributes, please configure log collection manually.
```

```bash
kubectl describe pods

Name:         collectron-opentelemetry-collector-95d49d596-dhf8s
Namespace:    default
```

save the id:

```bash
collectron_id=$(kubectl get pods | grep -i 'collectron' | cut -d ' ' -f1)
```

```bash
kubectl logs $collectron_id -f

# Example logs:
2022-09-24T06:55:15.020Z        info    service/telemetry.go:115        Setting up own telemetry...
2022-09-24T06:55:15.021Z        info    service/telemetry.go:156        Serving Prometheus metrics      {"address": "0.0.0.0:8888", "level": "basic"}
2022-09-24T06:55:15.021Z        info    components/components.go:30     In development component. May change in the future.   {"kind": "exporter", "data_type": "traces", "name": "logging", "stability": "in development"}
2022-09-24T06:55:15.021Z        info    memorylimiterprocessor/memorylimiter.go:113     Memory limiter configured       {"kind": "processor", "name": "memory_limiter", "pipeline": "traces", "limit_mib": 409, "spike_limit_mib": 128, "check_interval": 5}

2022-09-24T06:55:15.024Z        info    pipelines/pipelines.go:102      Receiver is starting... {"kind": "receiver", "name": "otlp", "pipeline": "metrics"}
2022-09-24T06:55:15.024Z        info    otlpreceiver/otlp.go:88 Starting HTTP server on endpoint 0.0.0.0:4318   {"kind": "receiver", "name": "otlp", "pipeline": "metrics"}
2022-09-24T06:55:15.024Z        info    pipelines/pipelines.go:106      Receiver started.       {"kind": "receiver", "name": "otlp", "pipeline": "metrics"}

2022-09-24T07:15:35.169Z        info    MetricsExporter {"kind": "exporter", "data_type": "metrics", "name": "logging", "#metrics": 22}
2022-09-24T07:15:45.029Z        info    MetricsExporter {"kind": "exporter", "data_type": "metrics", "name": "logging", "#metrics": 22}
```

Looking for error:

```bash
kubectl logs $collectron_id | grep error
```

removing all components we don't use by overding defaults in collector-values.yml [1](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/examples/deployment-otlp-traces/values.yaml)

upgrading again.

```bash
helm upgrade collectron open-telemetry/opentelemetry-collector --values collector-values.yaml
```

Expose external ip by adding NodePort (Because we run it localy and not on cloud otherwise it would be loadbalancer).



