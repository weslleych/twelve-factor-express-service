const express = require('express');
const config = require('./config');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// State flag for graceful shutdown handling
let isShuttingDown = false;

// Middleware to reject incoming requests during graceful shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Server is undergoing graceful shutdown.'
    });
  }
  next();
});

// Factor XI: Logs - stream request logs directly to stdout
app.use(requestLogger);

// Factor VI: Stateless processes - middleware for JSON payloads
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: config.appName,
    environment: config.nodeEnv,
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (Liveness & Readiness probe)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: config.appName,
    environment: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Factor VII: Port binding - export services via port binding
const server = app.listen(config.port, () => {
  console.log(
    `[${new Date().toISOString()}] [${config.appName}] Server running in ${config.nodeEnv} mode on port ${config.port}`
  );
});

// Track open sockets/connections to safely close and release them during shutdown
const activeConnections = new Set();
server.on('connection', (connection) => {
  activeConnections.add(connection);
  connection.on('close', () => {
    activeConnections.delete(connection);
  });
});

// Factor IX: Disposability - Fast startup and graceful shutdown
const gracefulShutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`[${new Date().toISOString()}] Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error while closing HTTP server:`, err);
      process.exit(1);
    }
    console.log(`[${new Date().toISOString()}] HTTP server closed. All active requests completed.`);
    process.exit(0);
  });

  // Close idle keep-alive sockets immediately
  if (typeof server.closeIdleConnections === 'function') {
    server.closeIdleConnections();
  }

  // Failsafe: force process termination if in-flight requests hang past timeout
  const SHUTDOWN_TIMEOUT_MS = 10000;
  const forceExitTimer = setTimeout(() => {
    console.warn(
      `[${new Date().toISOString()}] Shutdown timeout (${SHUTDOWN_TIMEOUT_MS}ms) reached. Forcefully destroying ${activeConnections.size} remaining connection(s).`
    );
    for (const socket of activeConnections) {
      socket.destroy();
    }
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimer.unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };
