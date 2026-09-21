/**
 * Factor XI: Logs
 * Treat logs as event streams.
 *
 * Middleware that intercepts incoming HTTP requests and streams structured logs
 * directly to stdout upon response completion, without storing files on disk.
 */

function requestLogger(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = Number(((seconds * 1e3) + (nanoseconds / 1e6)).toFixed(2));
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      method: req.method,
      route: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${durationMs}ms`
    };

    // Factor XI: Event stream directly to stdout
    console.log(JSON.stringify(logEntry));
  });

  next();
}

module.exports = requestLogger;
