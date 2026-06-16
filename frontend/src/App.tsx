import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type Repo = {
  id: number
  name: string
  html_url: string
  language: string | null
  stargazers_count: number
}

type MatchResult = {
  score: number
  matched: string[]
  missing: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function App() {
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState<Repo[]>([])
  const [resumeSkills, setResumeSkills] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [status, setStatus] = useState('')

  const portfolioLink = useMemo(() => {
    const slug = (username || 'preview').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${window.location.origin}/portfolio/${slug || 'preview'}`
  }, [username])

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`
  }

  const fetchRepos = async () => {
    if (!username.trim()) {
      setStatus('Enter a GitHub username before fetching repositories.')
      return
    }

    const response = await fetch(`${API_BASE_URL}/api/github/repos?username=${encodeURIComponent(username)}`)
    const payload = await response.json()

    if (!response.ok) {
      setStatus(payload.error || 'Failed to fetch repositories.')
      return
    }

    setRepos(payload.repos || [])
    setStatus('Repositories fetched successfully.')
  }

  const submitMatch = async (event: FormEvent) => {
    event.preventDefault()

    const response = await fetch(`${API_BASE_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeSkills: resumeSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        repoNames: repos.map((repo) => repo.name),
        jobDescription,
        portfolioUrl: portfolioLink.split('/').pop(),
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setStatus(payload.error || 'Failed to match job.')
      return
    }

    setMatch(payload)
    setStatus('Job match generated.')
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        <section className="rounded-lg bg-white p-5 shadow-sm lg:col-span-1">
          <h1 className="text-2xl font-bold">CodeCareer</h1>
          <p className="mt-2 text-sm text-slate-600">Resume + Portfolio Showcase & Job Matcher MVP</p>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="mt-4 w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Login with GitHub
          </button>
          <label className="mt-4 block text-sm font-medium">GitHub Username</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="octocat"
          />
          <button
            type="button"
            onClick={fetchRepos}
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          >
            Fetch Repositories
          </button>
          <p className="mt-4 text-xs text-slate-500">Shareable portfolio link:</p>
          <a href={portfolioLink} className="break-all text-sm text-blue-600 underline">
            {portfolioLink}
          </a>
          {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold">Dashboard</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded border border-slate-200 p-4">
              <h3 className="font-medium">Resume Upload</h3>
              <p className="mt-2 text-sm text-slate-600">
                Use API endpoint <code className="rounded bg-slate-100 px-1">/api/resume/upload</code> to upload PDF or text resumes.
              </p>
              <label className="mt-3 block text-sm">Resume skills (comma separated)</label>
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={resumeSkills}
                onChange={(event) => setResumeSkills(event.target.value)}
                placeholder="React, Node.js, SQL"
              />
            </div>

            <div className="rounded border border-slate-200 p-4">
              <h3 className="font-medium">Portfolio Preview</h3>
              <p className="mt-2 text-sm text-slate-600">
                Preview generated from fetched repositories and extracted resume skills.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {repos.slice(0, 5).map((repo) => (
                  <li key={repo.id}>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {repo.name}
                    </a>{' '}
                    {repo.language ? `(${repo.language})` : ''}
                  </li>
                ))}
                {!repos.length ? <li>No repositories loaded yet.</li> : null}
              </ul>
            </div>
          </div>

          <form className="mt-4 rounded border border-slate-200 p-4" onSubmit={submitMatch}>
            <h3 className="font-medium">Job Match Input</h3>
            <textarea
              className="mt-2 h-24 w-full rounded border border-slate-300 px-3 py-2"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste job description or required skills"
              required
            />
            <button
              type="submit"
              className="mt-3 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Run Match
            </button>
          </form>

          {match ? (
            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="font-semibold">Match score: {match.score}/100</p>
              <p className="mt-2">Matched: {match.matched.join(', ') || 'None'}</p>
              <p className="mt-1">Missing: {match.missing.join(', ') || 'None'}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default App
