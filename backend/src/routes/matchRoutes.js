const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { createMatch } = require('../controllers/matchController');

const router = express.Router();

router.post('/', asyncHandler(createMatch));

module.exports = router;
