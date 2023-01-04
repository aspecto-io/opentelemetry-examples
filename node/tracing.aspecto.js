const aspecto = require("@aspecto/opentelemetry");
const { trace } = require("@opentelemetry/api");

module.exports = (serviceName) => {            
  aspecto({
    aspectoAuth: process.env.ASPECTO_API_KEY,
    serviceName: serviceName,
    otlpCollectorEndpoint: "http://localhost:8081/v1/trace",
    writeSystemLogs: true
  });
  return trace.getTracerProvider().getTracer(serviceName);
};
