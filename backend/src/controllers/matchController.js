const { matchKeywords } = require('../services/matchingService');
const { run } = require('../db/database');

async function createMatch(req, res) {
  const { userId, resumeText, resumeSkills, repoNames, jobDescription, portfolioUrl } = req.body;

  if (!jobDescription) {
    res.status(400).json({ error: 'jobDescription is required' });
    return;
  }

  const result = matchKeywords({
    resumeText,
    resumeSkills: Array.isArray(resumeSkills) ? resumeSkills : [],
    repoNames: Array.isArray(repoNames) ? repoNames : [],
    jobText: jobDescription,
  });

  const writeResult = await run(
    `INSERT INTO job_matches (user_id, score, matched_keywords, missing_keywords, job_description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      Number(userId) || null,
      result.score,
      JSON.stringify(result.matched),
      JSON.stringify(result.missing),
      jobDescription,
    ],
  );

  if (portfolioUrl) {
    await run(
      `INSERT INTO portfolio_pages (user_id, share_slug, title, content_json)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(share_slug) DO UPDATE SET content_json=excluded.content_json, updated_at=CURRENT_TIMESTAMP`,
      [Number(userId) || null, portfolioUrl, 'Generated Portfolio', JSON.stringify({ resumeSkills, repoNames })],
    );
  }

  res.status(201).json({ id: writeResult.lastID, ...result });
}

module.exports = {
  createMatch,
};
