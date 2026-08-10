const app = require('./src/app');
const env = require('./src/config/env');

// Validate configuration before binding the port so the process exits with a
// clear message instead of starting in a broken state.
env.validateEnv();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
