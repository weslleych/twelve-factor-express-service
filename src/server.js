require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Factor VI: Stateless processes - middleware for JSON payloads
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'twelve-factor-express-service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (Liveness & Readiness probe)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Factor VII: Port binding - export services via port binding
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
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
