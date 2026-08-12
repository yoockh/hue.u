const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products.routes');
const skinAnalysisRouter = require('./routes/skinAnalysis.routes');
const tryOnRouter = require('./routes/tryOn.routes');
const historyRouter = require('./routes/history.routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/analyze-skin', skinAnalysisRouter);
app.use('/api/try-on', tryOnRouter);
app.use('/api/history', historyRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorMiddleware);

module.exports = app;
