const axios = require('axios');
const crypto = require('crypto');
const env = require('../../config/env');

// Perfect Corp does not accept a static API key. Every request must carry a
// short-lived id_token obtained by exchanging the client credentials. The token
// expires, so it is cached in memory and refreshed shortly before expiry.
let cachedToken = null;
let tokenExpiresAt = 0;

// Refresh a little before the real expiry so a token never lapses mid-request.
const EXPIRY_BUFFER_MS = 60 * 1000;

// Perfect Corp access tokens live for two hours; used as a fallback when the
// auth response omits an explicit lifetime.
const DEFAULT_TTL_SECONDS = 2 * 60 * 60;

// The auth handshake signs "client_id=<id>&timestamp=<ms>" with the RSA key
// (client_secret) issued alongside the client id, then exchanges it for an
// access token.
function buildIdToken() {
  const payload = `client_id=${env.PERFECTCORP_CLIENT_ID}&timestamp=${Date.now()}`;
  const encrypted = crypto.publicEncrypt(
    {
      key: env.PERFECTCORP_CLIENT_SECRET,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(payload, 'utf8')
  );
  return encrypted.toString('base64');
}

async function requestAccessToken() {
  const response = await axios.post(
    `${env.PERFECTCORP_BASE_URL}/s2s/v1.0/client/auth`,
    {
      client_id: env.PERFECTCORP_CLIENT_ID,
      id_token: buildIdToken()
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const result = response.data?.result;
  if (!result?.access_token) {
    throw new Error('Failed to obtain Perfect Corp access token.');
  }

  const ttlSeconds = Number(result.expires_in) || DEFAULT_TTL_SECONDS;
  cachedToken = result.access_token;
  tokenExpiresAt = Date.now() + ttlSeconds * 1000;
  return cachedToken;
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - EXPIRY_BUFFER_MS) {
    return cachedToken;
  }
  return requestAccessToken();
}

module.exports = { getAccessToken };
