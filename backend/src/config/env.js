const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  PERFECTCORP_API_KEY: process.env.PERFECTCORP_API_KEY,
  PERFECTCORP_BASE_URL: process.env.PERFECTCORP_BASE_URL || 'https://yce-api-01.makeupar.com',

  // Firebase Admin (Firestore) service-account credentials for scan history.
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key is stored in .env with literal "\n" sequences (a PEM key
  // spans multiple lines); convert them back to real newlines for the SDK.
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined
};

// Environment variables the server cannot run without: the PerfectCorp/YouCam V2
// API key (Bearer token on every request) and the Firebase service-account
// credentials used to persist and read scan history.
const REQUIRED_ENV = [
  'PERFECTCORP_API_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

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
