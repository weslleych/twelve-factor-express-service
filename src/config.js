/**
 * Factor III: Config
 * Store configuration in the environment.
 *
 * Centralized configuration module that reads, validates, and exposes
 * application settings from environment variables. Fails fast on invalid configs.
 */

require('dotenv').config();

const ALLOWED_ENVIRONMENTS = Object.freeze(['development', 'production', 'test']);

/**
 * Validates and parses the server TCP port.
 * @param {string|undefined} portRaw - Raw PORT value from process.env
 * @param {number} defaultPort - Default fallback port
 * @returns {number}
 */
function parsePort(portRaw, defaultPort = 3000) {
  if (!portRaw) {
    return defaultPort;
  }

  const parsed = Number(portRaw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(
      `[Config Error] Invalid PORT: "${portRaw}". Port must be an integer between 1 and 65535.`
    );
  }

  return parsed;
}

/**
 * Validates NODE_ENV against allowed environments.
 * @param {string|undefined} envRaw - Raw NODE_ENV value from process.env
 * @param {string} defaultEnv - Default fallback environment
 * @returns {string}
 */
function parseNodeEnv(envRaw, defaultEnv = 'development') {
  const env = (envRaw || defaultEnv).trim().toLowerCase();

  if (!ALLOWED_ENVIRONMENTS.includes(env)) {
    throw new Error(
      `[Config Error] Invalid NODE_ENV: "${envRaw}". Allowed values are: ${ALLOWED_ENVIRONMENTS.join(', ')}.`
    );
  }

  return env;
}

/**
 * Validates APP_NAME.
 * @param {string|undefined} nameRaw - Raw APP_NAME value from process.env
 * @param {string} defaultName - Default fallback application name
 * @returns {string}
 */
function parseAppName(nameRaw, defaultName = 'twelve-factor-express-service') {
  const name = (nameRaw || defaultName).trim();

  if (name.length === 0) {
    throw new Error('[Config Error] APP_NAME cannot be empty.');
  }

  return name;
}

// Parse and validate configuration
const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
const port = parsePort(process.env.PORT);
const appName = parseAppName(process.env.APP_NAME);

/**
 * Immutable configuration object
 */
const config = Object.freeze({
  appName,
  nodeEnv,
  port,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
  isTest: nodeEnv === 'test'
});

module.exports = config;
