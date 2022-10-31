use opentelemetry::{global, KeyValue};

use opentelemetry::sdk::propagation::TraceContextPropagator;
use opentelemetry::sdk::{trace, Resource};
use std::env;
use tracing_bunyan_formatter::{BunyanFormattingLayer, JsonStorageLayer};
use tracing_subscriber::Registry;
use tracing_subscriber::{prelude::*, EnvFilter};

pub fn init_telemetry() {

    let exporter = opentelemetry_otlp::new_exporter().tonic();

    // Define Tracer
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(exporter)
        .with_trace_config(
            trace::config().with_resource(Resource::new(vec![KeyValue::new(
                opentelemetry_semantic_conventions::resource::SERVICE_NAME.to_string(),
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

    global::set_text_map_propagator(TraceContextPropagator::new());

    subscriber
        .with(env_filter)
        .with(tracing_leyer)
        .with(JsonStorageLayer)
        .with(formatting_layer)
        .init()
}
