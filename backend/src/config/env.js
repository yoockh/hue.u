const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  PERFECTCORP_API_KEY: process.env.PERFECTCORP_API_KEY,
  PERFECTCORP_BASE_URL: process.env.PERFECTCORP_BASE_URL || 'https://yce-api-01.makeupar.com'
};

// Environment variables the server cannot run without. The PerfectCorp/YouCam V2
// API key is sent as a Bearer token on every request; without it every API call
// fails with 401. (V2 replaced the V1 client_id + RSA client_secret pair with a
// single API key.)
const REQUIRED_ENV = ['PERFECTCORP_API_KEY'];

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
