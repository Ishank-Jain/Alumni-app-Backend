// const { NodeSDK } = require('@opentelemetry/sdk-node');
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
// // REMOVED OTLPMetricExporter
// const { AlwaysOnSampler } = require('@opentelemetry/sdk-trace-base');
// const { B3Propagator, B3InjectEncoding } = require('@opentelemetry/propagator-b3');
// const { CompositePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');
// const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
// const { Resource } = require('@opentelemetry/resources');

// const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector.observability.svc.cluster.local:4318';

// const traceExporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });

// const sdk = new NodeSDK({
//   resource: new Resource({
//     'service.name': 'alumni-backend',
//   }),
  
//   traceExporter: traceExporter,
//   // REMOVED metricExporter parameter
//   sampler: new AlwaysOnSampler(),
//   textMapPropagator: new CompositePropagator({
//     propagators: [
//       new B3Propagator(),
//       new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
//       new W3CTraceContextPropagator(),
//     ],
//   }),
//   instrumentations: [
//     getNodeAutoInstrumentations({
//       '@opentelemetry/instrumentation-http': {
//         ignoreIncomingRequestHook: (req) => {
//           return req.url.includes('/metrics') || req.url.includes('/health');
//         }
//       },
//       '@opentelemetry/instrumentation-express': {
//         ignoreLayersType: ['router']
//       }
//     })
//   ],
//   spanProcessor: new SimpleSpanProcessor(traceExporter),
// });

// sdk.start();
// console.log(`✅ Telemetry initialized (HTTP/Simple), exporting to: ${endpoint}`);

// process.on('SIGTERM', () => {
//   sdk.shutdown().finally(() => process.exit(0));
// });

// module.exports = sdk;





const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

// 1. ADDED THIS IMPORT TO THE TOP
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics'); 

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT; // --- || 'http://otel-collector.observability.svc.cluster.local:4318' add this is needed on dev

if (!endpoint) {
  console.warn("⚠️  OTEL_EXPORTER_OTLP_ENDPOINT is not defined. Tracing is disabled.");
}

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })),
  
  // 2. FIXED THIS LINE (No inline require)
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
    exportIntervalMillis: 60000
  }),
  
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => req.url.includes('/metrics') || req.url.includes('/health')
      }
    })
  ]
});

sdk.start();
console.log(`✅ Telemetry initialized, HTTP exporting to: ${endpoint}`);