const express = require('express');
const upload = require('../middleware/upload');
const { tryOn } = require('../controllers/tryOn.controller');

const router = express.Router();

router.post(
  '/',
  upload.fields([
    { name: 'src_image', maxCount: 1 },
    { name: 'ref_image', maxCount: 1 }
  ]),
  tryOn
);

module.exports = router;
