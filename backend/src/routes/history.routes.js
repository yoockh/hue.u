const express = require('express');
const { listHistory } = require('../controllers/history.controller');

const router = express.Router();

router.get('/', listHistory);

module.exports = router;
