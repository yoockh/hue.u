const env = require('../../config/env');

// PerfectCorp / YouCam V2 authentication is a static API key sent directly as a
// Bearer token on every request (Authorization: Bearer <API_KEY>). See the
// official quick start guide: https://docs.perfectcorp.com/develop/quick_start_guide
//
// This replaces the deprecated V1 scheme, which RSA-signed a client_id/timestamp
// payload into an id_token and exchanged it at /s2s/v1.0/client/auth for a
// short-lived access token. V2 has no token exchange, no expiry, and no signing,
// so there is nothing to cache or refresh — the configured key is the credential.
function getAccessToken() {
  return env.PERFECTCORP_API_KEY;
}

module.exports = { getAccessToken };
