const express = require('express');
const multer = require('multer');
const path = require('node:path');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadResume } = require('../controllers/resumeController');

const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', upload.single('resume'), asyncHandler(uploadResume));

module.exports = router;
