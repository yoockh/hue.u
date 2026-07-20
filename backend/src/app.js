const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
