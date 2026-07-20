const axios = require('axios');
const env = require('../../config/env');

const client = axios.create({
  baseURL: env.PERFECTCORP_BASE_URL,
  headers: {
    'Authorization': `Bearer ${env.PERFECTCORP_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

module.exports = client;
