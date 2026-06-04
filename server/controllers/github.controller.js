import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import AppError from '../utils/AppError.js';
import { fetchGitHubUser, fetchUserRepos, deriveInsights } from '../utils/githubService.js';
import { getPool } from '../configs/dbConn.js';

/**
 * @ANALYZE_PROFILE
 * @ROUTE @POST /api/v1/github/analyze/:username
 * @ACCESS Public
 * Fetches GitHub user data, derives insights, upserts into MySQL
 */
export const analyzeProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  if (!username || username.trim() === '') {
    return next(new AppError('GitHub username is required', 400));
  }

  // Fetch from GitHub API
  let user, repos;
  try {
    [user, repos] = await Promise.all([
      fetchGitHubUser(username),
      fetchUserRepos(username),
    ]);
  } catch (error) {
    if (error.response?.status === 404) {
      return next(new AppError(`GitHub user '${username}' not found`, 404));
    }
    if (error.response?.status === 403) {
      return next(new AppError('GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env to increase limits.', 429));
    }
    return next(new AppError(`Failed to fetch GitHub data: ${error.message}`, 502));
  }

  const insights = deriveInsights(user, repos);

  const pool = getPool();

  // Upsert: insert or update if username already analyzed
  const upsertQuery = `
    INSERT INTO github_profiles (
      username, name, bio, avatar_url, github_url, company, blog, location,
      email, twitter_username, public_repos, public_gists, followers, following,
      total_stars, total_forks, top_languages, most_starred_repo,
      most_starred_repo_stars, account_age_days, account_created_at,
      hireable, site_admin, analyzed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      bio = VALUES(bio),
      avatar_url = VALUES(avatar_url),
      github_url = VALUES(github_url),
      company = VALUES(company),
      blog = VALUES(blog),
      location = VALUES(location),
      email = VALUES(email),
      twitter_username = VALUES(twitter_username),
      public_repos = VALUES(public_repos),
      public_gists = VALUES(public_gists),
      followers = VALUES(followers),
      following = VALUES(following),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      top_languages = VALUES(top_languages),
      most_starred_repo = VALUES(most_starred_repo),
      most_starred_repo_stars = VALUES(most_starred_repo_stars),
      account_age_days = VALUES(account_age_days),
      account_created_at = VALUES(account_created_at),
      hireable = VALUES(hireable),
      site_admin = VALUES(site_admin),
      analyzed_at = NOW()
  `;

  const values = [
    insights.username,
    insights.name,
    insights.bio,
    insights.avatar_url,
    insights.github_url,
    insights.company,
    insights.blog,
    insights.location,
    insights.email,
    insights.twitter_username,
    insights.public_repos,
    insights.public_gists,
    insights.followers,
    insights.following,
    insights.total_stars,
    insights.total_forks,
    insights.top_languages,
    insights.most_starred_repo,
    insights.most_starred_repo_stars,
    insights.account_age_days,
    insights.account_created_at,
    insights.hireable,
    insights.site_admin,
  ];

  await pool.query(upsertQuery, values);

  // Fetch the saved record to return
  const [rows] = await pool.query(
    'SELECT * FROM github_profiles WHERE username = ?',
    [insights.username]
  );

  const savedProfile = rows[0];
  if (savedProfile.top_languages) {
    savedProfile.top_languages =
      typeof savedProfile.top_languages === 'string'
        ? JSON.parse(savedProfile.top_languages)
        : savedProfile.top_languages;
  }

  res.status(200).json({
    success: true,
    message: `Profile for '${username}' analyzed and stored successfully`,
    profile: savedProfile,
  });
});

/**
 * @GET_ALL_PROFILES
 * @ROUTE @GET /api/v1/github/profiles
 * @ACCESS Public
 */
export const getAllProfiles = asyncHandler(async (req, res, _next) => {
  const pool = getPool();

  // Support pagination via query params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const [profiles] = await pool.query(
    `SELECT id, username, name, avatar_url, github_url, location, public_repos,
     followers, following, total_stars, top_languages, most_starred_repo,
     most_starred_repo_stars, analyzed_at
     FROM github_profiles
     ORDER BY analyzed_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) as total FROM github_profiles'
  );

  // Parse JSON fields
  profiles.forEach((p) => {
    if (p.top_languages) {
      p.top_languages =
        typeof p.top_languages === 'string'
          ? JSON.parse(p.top_languages)
          : p.top_languages;
    }
  });

  res.status(200).json({
    success: true,
    message: 'All analyzed profiles fetched successfully',
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    profiles,
  });
});

/**
 * @GET_SINGLE_PROFILE
 * @ROUTE @GET /api/v1/github/profiles/:username
 * @ACCESS Public
 */
export const getSingleProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const pool = getPool();

  const [rows] = await pool.query(
    'SELECT * FROM github_profiles WHERE username = ?',
    [username]
  );

  if (!rows.length) {
    return next(
      new AppError(
        `Profile for '${username}' not found. Analyze it first via POST /api/v1/github/analyze/${username}`,
        404
      )
    );
  }

  const profile = rows[0];
  if (profile.top_languages) {
    profile.top_languages =
      typeof profile.top_languages === 'string'
        ? JSON.parse(profile.top_languages)
        : profile.top_languages;
  }


  res.status(200).json({
    success: true,
    message: `Profile for '${username}' fetched successfully`,
    profile,
  });
});

/**
 * @DELETE_PROFILE
 * @ROUTE @DELETE /api/v1/github/profiles/:username
 * @ACCESS Public
 */
export const deleteProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const pool = getPool();

  const [result] = await pool.query(
    'DELETE FROM github_profiles WHERE username = ?',
    [username]
  );

  if (result.affectedRows === 0) {
    return next(new AppError(`Profile for '${username}' not found`, 404));
  }

  res.status(200).json({
    success: true,
    message: `Profile for '${username}' deleted successfully`,
  });
});

/**
 * @COMPARE_PROFILES
 * @ROUTE @GET /api/v1/github/compare?users=user1,user2
 * @ACCESS Public
 * Bonus: compare two or more stored profiles side-by-side
 */
export const compareProfiles = asyncHandler(async (req, res, next) => {
  const { users } = req.query;

  if (!users) {
    return next(new AppError('Provide users query param, e.g. ?users=torvalds,gaearon', 400));
  }

  const usernames = users.split(',').map((u) => u.trim()).filter(Boolean);

  if (usernames.length < 2) {
    return next(new AppError('Provide at least two usernames to compare', 400));
  }

  const pool = getPool();
  const placeholders = usernames.map(() => '?').join(', ');

  const [rows] = await pool.query(
    `SELECT username, name, avatar_url, public_repos, followers, following,
     total_stars, total_forks, top_languages, most_starred_repo,
     most_starred_repo_stars, account_age_days, hireable, analyzed_at
     FROM github_profiles WHERE username IN (${placeholders})`,
    usernames
  );

  rows.forEach((r) => {
    if (r.top_languages) {
      r.top_languages =
        typeof r.top_languages === 'string'
          ? JSON.parse(r.top_languages)
          : r.top_languages;
    }
  });

  const notFound = usernames.filter((u) => !rows.find((r) => r.username === u));
  if (notFound.length) {
    return next(
      new AppError(
        `These profiles haven't been analyzed yet: ${notFound.join(', ')}. Analyze them first.`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    message: 'Profiles compared successfully',
    profiles: rows,
  });
});

/**
 * @GET_STATS
 * @ROUTE @GET /api/v1/github/stats
 * @ACCESS Public
 * Bonus: aggregate stats across all stored profiles
 */
export const getStats = asyncHandler(async (req, res, _next) => {
  const pool = getPool();

  const [[summary]] = await pool.query(`
    SELECT
      COUNT(*) AS total_profiles_analyzed,
      MAX(followers) AS max_followers,
      AVG(followers) AS avg_followers,
      MAX(total_stars) AS max_stars,
      AVG(total_stars) AS avg_stars,
      MAX(public_repos) AS max_repos,
      AVG(public_repos) AS avg_repos
    FROM github_profiles
  `);

  const [topByFollowers] = await pool.query(`
    SELECT username, name, avatar_url, followers
    FROM github_profiles ORDER BY followers DESC LIMIT 5
  `);

  const [topByStars] = await pool.query(`
    SELECT username, name, avatar_url, total_stars
    FROM github_profiles ORDER BY total_stars DESC LIMIT 5
  `);

  res.status(200).json({
    success: true,
    message: 'Stats fetched successfully',
    stats: {
      summary,
      top_by_followers: topByFollowers,
      top_by_stars: topByStars,
    },
  });
});
