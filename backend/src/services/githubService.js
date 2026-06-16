async function fetchGithub(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `token ${token}` } : {}),
      'User-Agent': 'CodeCareer-MVP',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${message}`);
  }

  return response.json();
}

async function fetchRepos({ username, token }) {
  const endpoint = token
    ? 'https://api.github.com/user/repos?sort=updated&per_page=100'
    : `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`;

  const repos = await fetchGithub(endpoint, token);

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    updated_at: repo.updated_at,
  }));
}

module.exports = {
  fetchRepos,
  fetchGithub,
};
