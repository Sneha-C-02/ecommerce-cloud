const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'ecommerce-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({
    register,
    prefix: 'nodejs_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Create a custom Gauge metric for inventory count
const inventoryGauge = new client.Gauge({
    name: 'inventory_item_count',
    help: 'Total number of items in inventory',
    registers: [register]
});

// Create additional custom metrics if needed
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

module.exports = {
    register,
    inventoryGauge,
    httpRequestDuration,
    httpRequestTotal
};
