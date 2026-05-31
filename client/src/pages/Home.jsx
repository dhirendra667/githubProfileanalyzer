import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { analyzeProfile, clearCurrentProfile } from '../redux/slices/githubSlice';

const StatCard = ({ label, value, icon }) => (
  <div className="stat-card rounded-xl p-4 flex flex-col gap-1">
    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
      {icon} {label}
    </span>
    <span className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
      {value?.toLocaleString() ?? '—'}
    </span>
  </div>
);

const LanguagePill = ({ lang, count }) => (
  <span className="lang-pill px-3 py-1 rounded-full flex items-center gap-1">
    {lang}
    <span className="opacity-50">({count})</span>
  </span>
);

const Home = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const { analyzing, currentProfile } = useSelector((state) => state.github);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    dispatch(clearCurrentProfile());
    await dispatch(analyzeProfile(username.trim()));
  };

  const p = currentProfile;

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="text-center flex flex-col gap-4 pt-6">
        <h1 className="text-5xl font-black leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          GitHub Profile{' '}
          <span className="gradient-text">Analyzer</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Enter any GitHub username to fetch public profile data, derive rich insights,
          and store them in a MySQL database.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleAnalyze} className="flex gap-3 max-w-xl mx-auto w-full">
        <div className="flex-1 relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
          >
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="torvalds"
            className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={analyzing || !username.trim()}
          className="btn-primary px-6 py-3 rounded-xl text-sm"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      {/* Result */}
      {p && (
        <div
          className="rounded-2xl p-6 flex flex-col gap-6 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <img
              src={p.avatar_url}
              alt={p.username}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: '2px solid var(--acid-green)' }}
            />
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {p.name || p.username}
                </h2>
                {p.hireable && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(181,255,58,0.15)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace' }}
                  >
                    hireable
                  </span>
                )}
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                @{p.username}
              </span>
              {p.bio && (
                <p className="text-sm mt-1" style={{ color: '#9a9ab0', lineHeight: 1.6 }}>
                  {p.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {p.location && <span>📍 {p.location}</span>}
                {p.company && <span>🏢 {p.company}</span>}
                {p.blog && (
                  <a href={p.blog.startsWith('http') ? p.blog : `https://${p.blog}`} target="_blank" rel="noreferrer" style={{ color: 'var(--acid-green)' }}>
                    🌐 {p.blog}
                  </a>
                )}
                {p.twitter_username && <span>🐦 @{p.twitter_username}</span>}
              </div>
            </div>
            <a
              href={p.github_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-2 rounded-lg border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
            >
              View on GitHub ↗
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Public Repos" value={p.public_repos} icon="📦" />
            <StatCard label="Followers" value={p.followers} icon="👥" />
            <StatCard label="Following" value={p.following} icon="➡️" />
            <StatCard label="Public Gists" value={p.public_gists} icon="📝" />
            <StatCard label="Total Stars" value={p.total_stars} icon="⭐" />
            <StatCard label="Total Forks" value={p.total_forks} icon="🍴" />
            <StatCard label="Account Age (days)" value={p.account_age_days} icon="📅" />
            <StatCard label="Top Repo Stars" value={p.most_starred_repo_stars} icon="🏆" />
          </div>

          {/* Most Starred Repo */}
          {p.most_starred_repo && (
            <div
              className="rounded-xl p-4 flex items-center justify-between border"
              style={{ background: 'rgba(181,255,58,0.04)', borderColor: 'rgba(181,255,58,0.15)' }}
            >
              <div>
                <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                  Most Starred Repository
                </span>
                <span className="font-semibold mt-1 block" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}>
                  {p.most_starred_repo}
                </span>
              </div>
              <span
                className="text-3xl font-black"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}
              >
                ★ {p.most_starred_repo_stars?.toLocaleString()}
              </span>
            </div>
          )}

          {/* Top Languages */}
          {p.top_languages?.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                Top Languages
              </span>
              <div className="flex flex-wrap gap-2">
                {p.top_languages.map((l) => (
                  <LanguagePill key={l.language} lang={l.language} count={l.repo_count} />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
              Analyzed at: {new Date(p.analyzed_at).toLocaleString()}
            </span>
            <Link
              to={`/profiles/${p.username}`}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(181,255,58,0.1)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace' }}
            >
              View Full Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
