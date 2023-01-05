const aspecto = require("@aspecto/opentelemetry");
const { trace } = require("@opentelemetry/api");

module.exports = (serviceName) => {
  aspecto({
    aspectoAuth: process.env.ASPECTO_API_KEY,
    serviceName: serviceName,
  });
  return trace.getTracerProvider().getTracer(serviceName);
};
