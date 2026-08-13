const express = require('express');
const { getProducts, getProductMatches } = require('../controllers/products.controller');

const router = express.Router();

router.get('/', getProducts);
// Season-aware ranking. Registered before any '/:id' route so the literal
// "match" path is not captured as an id.
router.get('/match', getProductMatches);

module.exports = router;
