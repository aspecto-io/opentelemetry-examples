use opentelemetry::sdk::propagation::TraceContextPropagator;
use opentelemetry::sdk::{trace, Resource};
use opentelemetry::KeyValue;
use opentelemetry::{global};
use opentelemetry_otlp::WithExportConfig;
use tracing_bunyan_formatter::{JsonStorageLayer, BunyanFormattingLayer};
use std::collections::HashMap;
use std::env;
use tracing_subscriber::Registry;
use tracing_subscriber::{prelude::*, EnvFilter};

pub fn init_telemetry() {
    // Define Aspecto exporter
    let exporter = opentelemetry_otlp::new_exporter()
        .http()
        .with_endpoint("https://otelcol.aspecto.io/v1/traces")
        .with_headers(HashMap::from([(
            "Authorization".into(),
            env::var("ASPECTO_API_KEY").unwrap().to_string(),
        )]));

    // Define Tracer
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(exporter)
        .with_trace_config(
            trace::config().with_resource(Resource::new(vec![KeyValue::new(
                opentelemetry_semantic_conventions::resource::SERVICE_NAME,
                env::var("SERVICE_NAME").unwrap().to_string(),
            )])),
        )
        .install_batch(opentelemetry::runtime::Tokio)
        .expect("Error - Failed to create tracer.");

    // Define subscriber with a tracing layer to use our tracer
    let subscriber = Registry::default();

    // Layer to filter traces based on level - trace, debug, info, warn, error.
    let env_filter = EnvFilter::try_from_default_env().unwrap_or(EnvFilter::new("INFO"));
    // Layer to add our configured tracer.
    let tracing_leyer = tracing_opentelemetry::layer().with_tracer(tracer);
    // Layer to print spans to stdout
    let formatting_layer = BunyanFormattingLayer::new(
        env::var("SERVICE_NAME").unwrap().to_string(),
        std::io::stdout,
    );
    
    // Setting a trace context prpropogation data.
    global::set_text_map_propagator(TraceContextPropagator::new());

    subscriber
        .with(env_filter)
        .with(tracing_leyer)
        .with(JsonStorageLayer)
        .with(formatting_layer)
        .init();
}
