// --- APP.JS ---
const express = require('express')
const errorHandler = require('./middlewares/errorHandler')
const cors = require('cors');
const app = express()
app.set('trust proxy', true);

const morgan = require('morgan');
const { trace } = require('@opentelemetry/api');

const client = require('prom-client');

// Initialize runtime resource monitoring
client.collectDefaultMetrics({ 
  prefix: 'alumni_backend_', 
  timeout: 5000 
});

// Custom transaction counter tracking active cluster traffic rates
const httpRequestsTotal = new client.Counter({
  name: 'alumni_backend_http_requests_total',
  help: 'Total number of HTTP requests handled by the alumni portal backend',
  labelNames: ['method', 'route', 'status']
});

// Middleware hook to register endpoint delays and increment metrics
app.use((req, res, next) => {
  res.on('finish', () => {
    // Ignore internal metrics scraping loop transactions to keep variables pure
    if (req.route && req.path !== '/metrics') {
      httpRequestsTotal.inc({ 
        method: req.method, 
        route: req.route.path, 
        status: res.statusCode 
      });
    }
  });
  next();
});

// Istio handles CORS in production, safe to allow all locally/internally
app.use(cors())
app.use(express.json())                    // parse JSON bodies
app.use(express.urlencoded({ extended: true }))

// NEW: Capture the Trace ID immediately when the request arrives
app.use((req, res, next) => {
    const span = trace.getActiveSpan();
    req.traceId = span ? span.spanContext().traceId : 'No-Trace';
    
    // Optional Pro-Tip: Send the trace ID back to the frontend browser for easy debugging
    if (span) {
        res.setHeader('x-trace-id', req.traceId);
    }
    next();
});

// 1. Create a custom Morgan token that pulls the active OpenTelemetry Trace ID
morgan.token('trace-id', (req) => {
    return req.traceId || 'No-Trace';
});

// 2. Format all HTTP requests as structured JSON for Loki
app.use(morgan((tokens, req, res) => {
    return JSON.stringify({
        level: 'info',
        app: 'alumni-backend',
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        response_time_ms: tokens['response-time'](req, res),
        traceId: tokens['trace-id'](req, res), // <--- Now it will grab the saved ID!
        timestamp: new Date().toISOString()
    });
}));

// PROMETHEUS SCRAPER TARGET ROUTE
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Health Check 
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Alumni API is running 🚀' })
})

// API Routes (v1) 
app.use('/api/v1', require('./routes/v1'));

app.use(errorHandler);

module.exports = app;