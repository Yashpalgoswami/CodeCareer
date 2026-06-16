const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { githubLogin, githubCallback } = require('../controllers/authController');

const router = express.Router();

router.get('/github', githubLogin);
router.get('/github/callback', asyncHandler(githubCallback));

module.exports = router;
