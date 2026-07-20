const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  PERFECTCORP_API_KEY: process.env.PERFECTCORP_API_KEY,
  PERFECTCORP_BASE_URL: process.env.PERFECTCORP_BASE_URL || 'https://yce-api-01.makeupar.com'
};
