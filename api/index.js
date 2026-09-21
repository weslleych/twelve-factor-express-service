/**
 * Vercel Serverless Function entry point
 * Re-exports the Express application for serverless invocation.
 */
const app = require('../src/server');

module.exports = app;
