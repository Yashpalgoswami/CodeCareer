const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadResume } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/upload', uploadRateLimit, upload.single('resume'), asyncHandler(uploadResume));

module.exports = router;
