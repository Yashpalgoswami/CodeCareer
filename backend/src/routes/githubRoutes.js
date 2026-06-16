const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { getRepos } = require('../controllers/githubController');

const router = express.Router();

router.get('/repos', asyncHandler(getRepos));

module.exports = router;
