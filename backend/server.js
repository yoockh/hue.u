const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
