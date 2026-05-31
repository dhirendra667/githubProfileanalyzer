import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getSingleProfile, analyzeProfile } from '../redux/slices/githubSlice';

const DetailRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
        {label}
      </span>
      <span className="text-sm font-medium text-right max-w-xs" style={{ color: '#e2e2f0' }}>
        {String(value)}
      </span>
    </div>
  );
};

const ProfileDetail = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { currentProfile: p, loading, analyzing } = useSelector((state) => state.github);

  useEffect(() => {
    dispatch(getSingleProfile(username));
  }, [username]);

  const handleReanalyze = () => {
    dispatch(analyzeProfile(username));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--acid-green)' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">404</p>
        <p className="font-semibold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>
          Profile not found
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          @{username} hasn't been analyzed yet.
        </p>
        <Link to="/" className="btn-primary inline-block mt-6 px-6 py-2 rounded-xl text-sm">
          Analyze @{username}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
        <Link to="/profiles" style={{ color: 'var(--acid-green)' }}>Profiles</Link>
        <span>/</span>
        <span>@{p.username}</span>
      </div>

      {/* Profile Header */}
      <div
        className="rounded-2xl p-6 border flex items-start gap-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <img
          src={p.avatar_url}
          alt={p.username}
          className="w-24 h-24 rounded-2xl flex-shrink-0"
          style={{ border: '2px solid var(--acid-green)' }}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
                {p.name || p.username}
              </h1>
              <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                @{p.username}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReanalyze}
                disabled={analyzing}
                className="text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                style={{ background: 'rgba(181,255,58,0.1)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace', border: '1px solid rgba(181,255,58,0.2)' }}
              >
                {analyzing ? '⟳ Refreshing...' : '⟳ Re-analyze'}
              </button>
              <a
                href={p.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm px-4 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-dark)', color: '#e2e2f0', fontFamily: 'DM Mono, monospace', border: '1px solid var(--border)' }}
              >
                GitHub ↗
              </a>
            </div>
          </div>
          {p.bio && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#9a9ab0' }}>
              {p.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {p.location && <span>📍 {p.location}</span>}
            {p.company && <span>🏢 {p.company}</span>}
            {p.email && <span>✉️ {p.email}</span>}
            {p.twitter_username && <span>🐦 @{p.twitter_username}</span>}
            {p.hireable && <span style={{ color: 'var(--acid-green)' }}>✅ Open to work</span>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Public Repos', value: p.public_repos, icon: '📦' },
          { label: 'Followers', value: p.followers, icon: '👥' },
          { label: 'Following', value: p.following, icon: '➡️' },
          { label: 'Public Gists', value: p.public_gists, icon: '📝' },
          { label: 'Total Stars', value: p.total_stars, icon: '⭐' },
          { label: 'Total Forks', value: p.total_forks, icon: '🍴' },
          { label: 'Days on GitHub', value: p.account_age_days, icon: '📅' },
          { label: 'Top Repo Stars', value: p.most_starred_repo_stars, icon: '🏆' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card rounded-xl p-4">
            <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
              {icon} {label}
            </span>
            <span className="text-2xl font-bold block mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              {value?.toLocaleString() ?? '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Most Starred Repo */}
      {p.most_starred_repo && (
        <div
          className="rounded-xl p-5 flex items-center justify-between border"
          style={{ background: 'rgba(181,255,58,0.04)', borderColor: 'rgba(181,255,58,0.2)' }}
        >
          <div>
            <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
              Most Starred Repository
            </span>
            <a
              href={`${p.github_url}/${p.most_starred_repo}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold mt-1 block hover:underline"
              style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}
            >
              {p.most_starred_repo} ↗
            </a>
          </div>
          <span className="text-4xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}>
            ★ {p.most_starred_repo_stars?.toLocaleString()}
          </span>
        </div>
      )}

      {/* Top Languages */}
      {p.top_languages?.length > 0 && (
        <div
          className="rounded-xl p-5 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
            Top Languages
          </h3>
          <div className="flex flex-col gap-3">
            {p.top_languages.map((l, i) => {
              const max = p.top_languages[0].repo_count;
              const pct = Math.round((l.repo_count / max) * 100);
              return (
                <div key={l.language} className="flex items-center gap-3">
                  <span
                    className="text-xs w-4 text-right"
                    style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
                  >
                    #{i + 1}
                  </span>
                  <span className="text-sm w-28 truncate" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}>
                    {l.language}
                  </span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'var(--acid-green)' }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                    {l.repo_count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Details */}
      <div
        className="rounded-xl p-5 border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
          Full Profile Details
        </h3>
        <DetailRow label="Username" value={p.username} />
        <DetailRow label="Name" value={p.name} />
        <DetailRow label="Email" value={p.email} />
        <DetailRow label="Company" value={p.company} />
        <DetailRow label="Location" value={p.location} />
        <DetailRow label="Website" value={p.blog} />
        <DetailRow label="Twitter" value={p.twitter_username && `@${p.twitter_username}`} />
        <DetailRow label="Account Created" value={p.account_created_at && new Date(p.account_created_at).toDateString()} />
        <DetailRow label="Site Admin" value={p.site_admin ? 'Yes' : 'No'} />
        <DetailRow label="Hireable" value={p.hireable ? 'Yes' : 'No'} />
        <DetailRow label="Last Analyzed" value={p.analyzed_at && new Date(p.analyzed_at).toLocaleString()} />
      </div>

      <Link
        to="/profiles"
        className="text-sm text-center py-3 block"
        style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
      >
        ← Back to all profiles
      </Link>
    </div>
  );
};

export default ProfileDetail;
