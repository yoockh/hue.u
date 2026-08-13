const express = require('express');
const {
  getProducts,
  getProductMatches,
  getProductMatchById
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/', getProducts);
// Season-aware ranking. Registered before the '/:id/match' route so the literal
// "match" path is not captured as an id.
router.get('/match', getProductMatches);
// Single-product match check plus alternative recommendations.
router.get('/:id/match', getProductMatchById);

module.exports = router;
