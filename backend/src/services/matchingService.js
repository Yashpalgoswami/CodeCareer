function tokenize(input = '') {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function toKeywordSet({ resumeText = '', resumeSkills = [], repoNames = [], jobText = '' }) {
  const resumeTokens = tokenize(resumeText);
  const repoTokens = tokenize(repoNames.join(' '));
  const skillTokens = resumeSkills.map((skill) => skill.toLowerCase());
  const candidate = new Set([...resumeTokens, ...repoTokens, ...skillTokens]);
  const required = new Set(tokenize(jobText));

  return { candidate, required };
}

function matchKeywords(payload) {
  const { candidate, required } = toKeywordSet(payload);
  const matched = [];
  const missing = [];

  required.forEach((keyword) => {
    if (candidate.has(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const union = new Set([...candidate, ...required]);
  const score = union.size === 0 ? 0 : Math.round((matched.length / union.size) * 100);

  // TODO: extend scoring with embeddings/LLM semantic matching in a future iteration.
  return {
    score,
    matched: matched.sort(),
    missing: missing.sort(),
    required: Array.from(required).sort(),
  };
}

module.exports = {
  tokenize,
  toKeywordSet,
  matchKeywords,
};
