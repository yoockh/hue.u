const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  PERFECTCORP_CLIENT_ID: process.env.PERFECTCORP_CLIENT_ID,
  PERFECTCORP_CLIENT_SECRET: process.env.PERFECTCORP_CLIENT_SECRET,
  PERFECTCORP_BASE_URL: process.env.PERFECTCORP_BASE_URL || 'https://yce-api-01.makeupar.com'
};
