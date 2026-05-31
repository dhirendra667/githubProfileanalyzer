import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

const githubAxios = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  },
});

/**
 * Fetch basic GitHub user profile
 */
export const fetchGitHubUser = async (username) => {
  const { data } = await githubAxios.get(`/users/${username}`);
  return data;
};

/**
 * Fetch all public repos of a user (handles pagination)
 */
export const fetchUserRepos = async (username) => {
  let page = 1;
  let repos = [];

  while (true) {
    const { data } = await githubAxios.get(`/users/${username}/repos`, {
      params: { per_page: 100, page, type: 'owner', sort: 'updated' },
    });

    repos = repos.concat(data);

    if (data.length < 100) break;
    page++;
  }

  return repos;
};

/**
 * Derive rich insights from user + repos data
 */
export const deriveInsights = (user, repos) => {
  // Aggregate stars and forks
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);

  // Language frequency map
  const langMap = {};
  repos.forEach((r) => {
    if (r.language) {
      langMap[r.language] = (langMap[r.language] || 0) + 1;
    }
  });

  // Top 5 languages sorted by usage
  const topLanguages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => ({ language: lang, repo_count: count }));

  // Most starred repo
  const mostStarred = repos.reduce(
    (best, r) => (r.stargazers_count > (best?.stargazers_count || 0) ? r : best),
    null
  );

  // Account age in days
  const createdAt = new Date(user.created_at);
  const accountAgeDays = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    username: user.login,
    name: user.name || null,
    bio: user.bio || null,
    avatar_url: user.avatar_url,
    github_url: user.html_url,
    company: user.company || null,
    blog: user.blog || null,
    location: user.location || null,
    email: user.email || null,
    twitter_username: user.twitter_username || null,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    total_stars: totalStars,
    total_forks: totalForks,
    top_languages: JSON.stringify(topLanguages),
    most_starred_repo: mostStarred?.name || null,
    most_starred_repo_stars: mostStarred?.stargazers_count || 0,
    account_age_days: accountAgeDays,
    account_created_at: user.created_at,
    hireable: user.hireable ? 1 : 0,
    site_admin: user.site_admin ? 1 : 0,
  };
};
