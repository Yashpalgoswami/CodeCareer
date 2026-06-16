const { fetchRepos } = require('../services/githubService');

async function getRepos(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.query.token;
  const username = req.query.username;

  if (!token && !username) {
    res.status(400).json({ error: 'Provide either Authorization bearer token or username query parameter' });
    return;
  }

  const repos = await fetchRepos({ username, token });
  res.json({ repos });
}

module.exports = {
  getRepos,
};
