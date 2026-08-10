const axios = require('axios');
const env = require('../../config/env');
const { getAccessToken } = require('./auth.service');

const client = axios.create({
  baseURL: env.PERFECTCORP_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject a fresh access token on every request instead of a static bearer,
// which Perfect Corp rejects with 401 InvalidAccessToken.
client.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

module.exports = client;
