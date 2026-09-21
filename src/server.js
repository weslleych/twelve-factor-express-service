const express = require('express');
const config = require('./config');

const app = express();

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

// Factor IX: Disposability - maximize robustness with fast startup and graceful shutdown
const handleShutdown = (signal) => {
  console.log(`[${new Date().toISOString()}] Received ${signal}. Starting graceful shutdown...`);
  server.close((err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error during shutdown:`, err);
      process.exit(1);
    }
    console.log(`[${new Date().toISOString()}] HTTP server closed successfully.`);
    process.exit(0);
  });

  // Failsafe: force exit if graceful shutdown takes longer than 10 seconds
  setTimeout(() => {
    console.error(`[${new Date().toISOString()}] Shutdown timeout reached. Forcing exit.`);
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = { app, server };
