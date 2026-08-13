const express = require('express');
const { listHistory, getLatestHistory } = require('../controllers/history.controller');

const router = express.Router();

router.get('/', listHistory);
// Most recent scan only. Registered before any '/:id' route so "latest" is not
// captured as an id.
router.get('/latest', getLatestHistory);

module.exports = router;
