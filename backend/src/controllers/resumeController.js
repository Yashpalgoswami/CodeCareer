const fs = require('node:fs');
const path = require('node:path');
const { parseResumeFile } = require('../services/resumeParserService');
const { run } = require('../db/database');

async function uploadResume(req, res) {
  if (!req.file) {
    res.status(400).json({ error: 'Resume file is required' });
    return;
  }

  const parsed = await parseResumeFile(req.file.path, req.file.mimetype);

  await run(
    `INSERT INTO resumes (user_id, file_name, raw_text, parsed_skills, parsed_sections)
     VALUES (?, ?, ?, ?, ?)`,
    [
      Number(req.body.userId) || null,
      path.basename(req.file.originalname),
      parsed.text,
      JSON.stringify(parsed.skills),
      JSON.stringify(parsed.sections),
    ],
  );

  fs.unlink(req.file.path, () => {});

  res.status(201).json(parsed);
}

module.exports = {
  uploadResume,
};
