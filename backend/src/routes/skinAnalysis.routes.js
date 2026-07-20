const express = require('express');
const upload = require('../middleware/upload');
const { analyzeSkin } = require('../controllers/skinAnalysis.controller');

const router = express.Router();

router.post('/', upload.single('image'), analyzeSkin);

module.exports = router;
