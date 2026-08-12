const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const productsRouter = require('./routes/products.routes');
const skinAnalysisRouter = require('./routes/skinAnalysis.routes');
const tryOnRouter = require('./routes/tryOn.routes');
const openapiSpec = require('./config/openapi');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Interactive API docs (browser "Try it out"). See TESTING.md for curl equivalents.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/products', productsRouter);
app.use('/api/analyze-skin', skinAnalysisRouter);
app.use('/api/try-on', tryOnRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorMiddleware);

module.exports = app;
