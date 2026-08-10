const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  PERFECTCORP_CLIENT_ID: process.env.PERFECTCORP_CLIENT_ID,
  PERFECTCORP_CLIENT_SECRET: process.env.PERFECTCORP_CLIENT_SECRET,
  PERFECTCORP_BASE_URL: process.env.PERFECTCORP_BASE_URL || 'https://yce-api-01.makeupar.com'
};

// Environment variables the server cannot run without. Perfect Corp credentials
// are required to obtain an access token; without them every API call fails.
const REQUIRED_ENV = ['PERFECTCORP_CLIENT_ID', 'PERFECTCORP_CLIENT_SECRET'];

// Fail fast at boot instead of surfacing confusing 401s on the first request.
function validateEnv() {
  const missing = REQUIRED_ENV.filter(
    (key) => !env[key] || String(env[key]).trim() === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Set them in your .env file (see .env.example) before starting the server.'
    );
  }
}

env.validateEnv = validateEnv;

module.exports = env;
