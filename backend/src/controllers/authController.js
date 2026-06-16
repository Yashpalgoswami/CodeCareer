const { run } = require('../db/database');
const { fetchGithub } = require('../services/githubService');

function githubLogin(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'GitHub OAuth is not configured' });
    return;
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'read:user repo');

  res.redirect(url.toString());
}

async function githubCallback(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).json({ error: 'Missing OAuth code' });
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  });

  const tokenPayload = await tokenResponse.json();

  if (!tokenPayload.access_token) {
    res.status(400).json({ error: 'Unable to retrieve access token', details: tokenPayload });
    return;
  }

  const user = await fetchGithub('https://api.github.com/user', tokenPayload.access_token);

  await run(
    `INSERT INTO users (github_id, username, display_name, avatar_url, oauth_token)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(github_id) DO UPDATE SET
       username=excluded.username,
       display_name=excluded.display_name,
       avatar_url=excluded.avatar_url,
       oauth_token=excluded.oauth_token,
       updated_at=CURRENT_TIMESTAMP`,
    [user.id, user.login, user.name || user.login, user.avatar_url, tokenPayload.access_token],
  );

  res.json({
    accessToken: tokenPayload.access_token,
    user: {
      id: user.id,
      username: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
    },
  });
}

module.exports = {
  githubLogin,
  githubCallback,
};
