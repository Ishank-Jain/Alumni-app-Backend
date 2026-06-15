const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { AlwaysOnSampler } = require('@opentelemetry/sdk-trace-base');
const { B3Propagator, B3InjectEncoding } = require('@opentelemetry/propagator-b3');
const { CompositePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');

// --- NEW: Import SimpleSpanProcessor instead of BatchSpanProcessor ---
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector.observability.svc.cluster.local:4318';

const traceExporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });
const metricExporter = new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` });

// const exporter = new OTLPTraceExporter({ 
//     url: endpoint,
//     headers: {} 
// });

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  metricExporter: metricExporter,
  sampler: new AlwaysOnSampler(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new B3Propagator(),
      new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
      new W3CTraceContextPropagator(),
    ],
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => {
          return req.url.includes('/metrics') || req.url.includes('/health');
        }
      },
      '@opentelemetry/instrumentation-express': {
        ignoreLayersType: ['router']
      }
    })
  ],
    // --- NEW: Force immediate export of every single trace ---
    spanProcessor: new SimpleSpanProcessor(traceExporter),
});

sdk.start();
console.log(`✅ Telemetry initialized (HTTP/Simple), exporting to: ${endpoint}`);

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});

module.exports = sdk;