import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { analyzeProfile, clearCurrentProfile } from '../redux/slices/githubSlice';

const LANG_COLORS = ['#00ff87', '#4f8ef7', '#a855f7', '#fb923c', '#f472b6'];

const SpinnerIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const MetricBadge = ({ label, value, color = 'var(--green)' }) => (
  <div className="stat-card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, color, lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
    </div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </div>
  </div>
);

const ExampleUser = ({ name, onClick }) => (
  <button
    onClick={() => onClick(name)}
    style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
      padding: '6px 14px', borderRadius: '99px', cursor: 'pointer',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.target.style.borderColor = 'var(--border-hover)'; e.target.style.color = 'var(--green)'; }}
    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-2)'; }}
  >
    @{name}
  </button>
);

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)' }}>
        <div style={{ color: 'var(--green)' }}>{payload[0]?.payload?.metric}</div>
        <div style={{ color: 'var(--text-2)' }}>Score: {payload[0]?.value}</div>
      </div>
    );
  }
  return null;
};

const buildRadarData = (p) => {
  if (!p) return [];
  const normalize = (val, max) => Math.min(100, Math.round((val / max) * 100));
  return [
    { metric: 'Repos', value: normalize(p.public_repos, 200) },
    { metric: 'Followers', value: normalize(p.followers, 10000) },
    { metric: 'Stars', value: normalize(p.total_stars, 5000) },
    { metric: 'Forks', value: normalize(p.total_forks, 2000) },
    { metric: 'Gists', value: normalize(p.public_gists, 100) },
    { metric: 'Activity', value: normalize(Math.max(0, 5000 - p.account_age_days), 5000) },
  ];
};

const Home = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const { analyzing, currentProfile: p } = useSelector((s) => s.github);

  const handleAnalyze = async (uname) => {
    const target = uname || username.trim();
    if (!target) return;
    setUsername(target);
    dispatch(clearCurrentProfile());
    await dispatch(analyzeProfile(target));
  };

  const radarData = buildRadarData(p);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>

      {/* ── Hero ── */}
      <div className="fade-up" style={{ textAlign: 'center', paddingTop: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div className="glow-dot" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-2)', letterSpacing: '0.08em' }}>
            POWERED BY GITHUB PUBLIC API
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.05, marginBottom: '20px' }}>
          Analyze any GitHub
          <br />
          <span className="grad-text">profile instantly</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7, fontWeight: 300 }}>
          Fetch public insights, visualize contribution patterns, and store analysis results — all in one place.
        </p>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
          style={{ display: 'flex', gap: '10px', maxWidth: '520px', margin: '0 auto 20px' }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontSize: '0.9rem', userSelect: 'none',
            }}>@</span>
            <input
              className="gh-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={analyzing || !username.trim()}>
            {analyzing ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SpinnerIcon /> Analyzing</span> : 'Analyze →'}
          </button>
        </form>

        {/* Example usernames */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', alignSelf: 'center' }}>try:</span>
          {['torvalds', 'gaearon', 'sindresorhus', 'tj', 'yyx990803'].map((n) => (
            <ExampleUser key={n} name={n} onClick={handleAnalyze} />
          ))}
        </div>
      </div>

      {/* ── Feature Pills ── */}
      {!p && (
        <div className="fade-up-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {[
            { icon: '⭐', label: 'Total stars across all repos' },
            { icon: '🌐', label: 'Top languages breakdown' },
            { icon: '📈', label: 'Profile radar chart' },
            { icon: '💾', label: 'Stored in MySQL database' },
            { icon: '🔁', label: 'Re-analyze anytime' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '99px', padding: '8px 16px',
              fontSize: '0.82rem', color: 'var(--text-2)',
            }}>
              <span>{icon}</span>
              <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Result ── */}
      {p && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Profile header card */}
          <div className="card" style={{ padding: '28px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={p.avatar_url}
                alt={p.username}
                style={{ width: '88px', height: '88px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--green-border)' }}
              />
              <div style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'var(--green)', border: '2px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#080810"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>
                  {p.name || p.username}
                </h2>
                {p.hireable && <span className="badge badge-green">OPEN TO WORK</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '10px' }}>
                @{p.username}
              </div>
              {p.bio && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '12px', maxWidth: '480px' }}>
                  {p.bio}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                {p.location && <span>📍 {p.location}</span>}
                {p.company && <span>🏢 {p.company}</span>}
                {p.blog && (
                  <a href={p.blog.startsWith('http') ? p.blog : `https://${p.blog}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>
                    🌐 {p.blog}
                  </a>
                )}
                {p.twitter_username && <span>𝕏 @{p.twitter_username}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: 'auto' }}>
              <a
                href={p.github_url} target="_blank" rel="noreferrer"
                className="btn-ghost"
                style={{ textDecoration: 'none', textAlign: 'center' }}
              >
                View on GitHub ↗
              </a>
              <Link
                to={`/profiles/${p.username}`}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textAlign: 'center',
                  padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                  background: 'var(--green-dim)', border: '1px solid var(--green-border)', color: 'var(--green)',
                }}
              >
                Full Profile →
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            <MetricBadge label="Public Repos" value={p.public_repos} color="var(--green)" />
            <MetricBadge label="Followers" value={p.followers} color="var(--blue)" />
            <MetricBadge label="Following" value={p.following} color="var(--text-2)" />
            <MetricBadge label="Total Stars" value={p.total_stars} color="var(--yellow)" />
            <MetricBadge label="Total Forks" value={p.total_forks} color="var(--orange)" />
            <MetricBadge label="Public Gists" value={p.public_gists} color="var(--purple)" />
            <MetricBadge label="Days on GitHub" value={p.account_age_days} color="var(--pink)" />
            <MetricBadge label="Top Repo ★" value={p.most_starred_repo_stars} color="var(--yellow)" />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Radar chart */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Profile Radar
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#9898b8' }}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Radar
                    dataKey="value"
                    stroke="var(--green)"
                    fill="var(--green)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Languages chart */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
                Top Languages
              </div>
              {p.top_languages?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {p.top_languages.map((l, i) => {
                    const max = p.top_languages[0].repo_count;
                    const pct = Math.round((l.repo_count / max) * 100);
                    const color = LANG_COLORS[i] || '#888';
                    return (
                      <div key={l.language}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                            {l.language}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            {l.repo_count} repos
                          </span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`, background: color,
                            borderRadius: '99px', transition: 'width 0.8s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '40px' }}>
                  No language data
                </div>
              )}
            </div>
          </div>

          {/* Most starred repo highlight */}
          {p.most_starred_repo && (
            <div className="card" style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(0,255,135,0.05) 0%, var(--bg-2) 60%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Most Starred Repository
                </div>
                <a
                  href={`${p.github_url}/${p.most_starred_repo}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {p.most_starred_repo} ↗
                </a>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>
                  ★ {p.most_starred_repo_stars?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>stars</div>
              </div>
            </div>
          )}

          {/* Footer row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              Analyzed · {new Date(p.analyzed_at).toLocaleString()}
            </span>
            <Link
              to={`/profiles/${p.username}`}
              style={{ fontSize: '0.8rem', color: 'var(--green)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            >
              View full breakdown →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { analyzeProfile, clearCurrentProfile } from '../redux/slices/githubSlice';

// const StatCard = ({ label, value, icon }) => (
//   <div className="stat-card rounded-xl p-4 flex flex-col gap-1">
//     <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//       {icon} {label}
//     </span>
//     <span className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
//       {value?.toLocaleString() ?? '—'}
//     </span>
//   </div>
// );

// const LanguagePill = ({ lang, count }) => (
//   <span className="lang-pill px-3 py-1 rounded-full flex items-center gap-1">
//     {lang}
//     <span className="opacity-50">({count})</span>
//   </span>
// );

// const Home = () => {
//   const [username, setUsername] = useState('');
//   const dispatch = useDispatch();
//   const { analyzing, currentProfile } = useSelector((state) => state.github);

//   const handleAnalyze = async (e) => {
//     e.preventDefault();
//     if (!username.trim()) return;
//     dispatch(clearCurrentProfile());
//     await dispatch(analyzeProfile(username.trim()));
//   };

//   const p = currentProfile;

//   return (
//     <div className="flex flex-col gap-10">
//       {/* Hero */}
//       <div className="text-center flex flex-col gap-4 pt-6">
//         <h1 className="text-5xl font-black leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
//           GitHub Profile{' '}
//           <span className="gradient-text">Analyzer</span>
//         </h1>
//         <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
//           Enter any GitHub username to fetch public profile data, derive rich insights,
//           and store them in a MySQL database.
//         </p>
//       </div>

//       {/* Search Bar */}
//       <form onSubmit={handleAnalyze} className="flex gap-3 max-w-xl mx-auto w-full">
//         <div className="flex-1 relative">
//           <span
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
//             style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
//           >
//             @
//           </span>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="torvalds"
//             className="input-field w-full pl-8 pr-4 py-3 rounded-xl text-sm"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={analyzing || !username.trim()}
//           className="btn-primary px-6 py-3 rounded-xl text-sm"
//         >
//           {analyzing ? (
//             <span className="flex items-center gap-2">
//               <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//               </svg>
//               Analyzing...
//             </span>
//           ) : (
//             'Analyze'
//           )}
//         </button>
//       </form>

//       {/* Result */}
//       {p && (
//         <div
//           className="rounded-2xl p-6 flex flex-col gap-6 border"
//           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
//         >
//           {/* Header */}
//           <div className="flex items-start gap-4">
//             <img
//               src={p.avatar_url}
//               alt={p.username}
//               className="w-20 h-20 rounded-2xl object-cover"
//               style={{ border: '2px solid var(--acid-green)' }}
//             />
//             <div className="flex flex-col gap-1 flex-1">
//               <div className="flex items-center gap-3">
//                 <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
//                   {p.name || p.username}
//                 </h2>
//                 {p.hireable && (
//                   <span
//                     className="text-xs px-2 py-0.5 rounded-full"
//                     style={{ background: 'rgba(181,255,58,0.15)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace' }}
//                   >
//                     hireable
//                   </span>
//                 )}
//               </div>
//               <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//                 @{p.username}
//               </span>
//               {p.bio && (
//                 <p className="text-sm mt-1" style={{ color: '#9a9ab0', lineHeight: 1.6 }}>
//                   {p.bio}
//                 </p>
//               )}
//               <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
//                 {p.location && <span>📍 {p.location}</span>}
//                 {p.company && <span>🏢 {p.company}</span>}
//                 {p.blog && (
//                   <a href={p.blog.startsWith('http') ? p.blog : `https://${p.blog}`} target="_blank" rel="noreferrer" style={{ color: 'var(--acid-green)' }}>
//                     🌐 {p.blog}
//                   </a>
//                 )}
//                 {p.twitter_username && <span>🐦 @{p.twitter_username}</span>}
//               </div>
//             </div>
//             <a
//               href={p.github_url}
//               target="_blank"
//               rel="noreferrer"
//               className="text-xs px-3 py-2 rounded-lg border transition-colors"
//               style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
//             >
//               View on GitHub ↗
//             </a>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <StatCard label="Public Repos" value={p.public_repos} icon="📦" />
//             <StatCard label="Followers" value={p.followers} icon="👥" />
//             <StatCard label="Following" value={p.following} icon="➡️" />
//             <StatCard label="Public Gists" value={p.public_gists} icon="📝" />
//             <StatCard label="Total Stars" value={p.total_stars} icon="⭐" />
//             <StatCard label="Total Forks" value={p.total_forks} icon="🍴" />
//             <StatCard label="Account Age (days)" value={p.account_age_days} icon="📅" />
//             <StatCard label="Top Repo Stars" value={p.most_starred_repo_stars} icon="🏆" />
//           </div>

//           {/* Most Starred Repo */}
//           {p.most_starred_repo && (
//             <div
//               className="rounded-xl p-4 flex items-center justify-between border"
//               style={{ background: 'rgba(181,255,58,0.04)', borderColor: 'rgba(181,255,58,0.15)' }}
//             >
//               <div>
//                 <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//                   Most Starred Repository
//                 </span>
//                 <span className="font-semibold mt-1 block" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}>
//                   {p.most_starred_repo}
//                 </span>
//               </div>
//               <span
//                 className="text-3xl font-black"
//                 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}
//               >
//                 ★ {p.most_starred_repo_stars?.toLocaleString()}
//               </span>
//             </div>
//           )}

//           {/* Top Languages */}
//           {p.top_languages?.length > 0 && (
//             <div className="flex flex-col gap-2">
//               <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//                 Top Languages
//               </span>
//               <div className="flex flex-wrap gap-2">
//                 {p.top_languages.map((l) => (
//                   <LanguagePill key={l.language} lang={l.language} count={l.repo_count} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Footer */}
//           <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
//             <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//               Analyzed at: {new Date(p.analyzed_at).toLocaleString()}
//             </span>
//             <Link
//               to={`/profiles/${p.username}`}
//               className="text-xs px-3 py-1.5 rounded-lg transition-all"
//               style={{ background: 'rgba(181,255,58,0.1)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace' }}
//             >
//               View Full Profile →
//             </Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;
