import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getSingleProfile, analyzeProfile } from '../redux/slices/githubSlice';

const LANG_COLORS = ['#00ff87', '#4f8ef7', '#a855f7', '#fb923c', '#f472b6'];

const buildRadarData = (p) => {
  const normalize = (val, max) => Math.min(100, Math.round((val / max) * 100));
  return [
    { metric: 'Repos', value: normalize(p.public_repos, 200) },
    { metric: 'Followers', value: normalize(p.followers, 10000) },
    { metric: 'Stars', value: normalize(p.total_stars, 5000) },
    { metric: 'Forks', value: normalize(p.total_forks, 2000) },
    { metric: 'Gists', value: normalize(p.public_gists, 100) },
    { metric: 'Tenure', value: normalize(Math.max(0, 5000 - p.account_age_days), 5000) },
  ];
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)' }}>
        <div style={{ color: 'var(--green)' }}>{payload[0]?.name || payload[0]?.payload?.metric}</div>
        <div style={{ color: 'var(--text-2)' }}>{payload[0]?.value?.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

const MetricRow = ({ label, value, color = 'var(--text)' }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color, fontFamily: 'var(--font-body)', textAlign: 'right', maxWidth: '55%' }}>{String(value)}</span>
    </div>
  );
};

const BigStat = ({ label, value, color = 'var(--green)', sub }) => (
  <div className="stat-card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, color, lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
    </div>
    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </div>
    {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '3px' }}>{sub}</div>}
  </div>
);

const ProfileDetail = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { currentProfile: p, loading, analyzing } = useSelector((s) => s.github);

  useEffect(() => { dispatch(getSingleProfile(username)); }, [username]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[200, 100, 300].map((h, i) => (
          <div key={i} style={{ height: `${h}px`, borderRadius: '16px' }} className="skeleton" />
        ))}
      </div>
    );
  }

  if (!p) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', color: 'var(--text-3)', marginBottom: '16px' }}>404</div>
        <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>@{username} hasn't been analyzed yet.</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Analyze @{username}</Link>
      </div>
    );
  }

  const radarData = buildRadarData(p);
  const pieData = p.top_languages?.map((l) => ({ name: l.language, value: l.repo_count })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-3)' }}>
        <Link to="/profiles" style={{ color: 'var(--green)', textDecoration: 'none' }}>Profiles</Link>
        <span>/</span>
        <span>@{p.username}</span>
      </div>

      {/* Profile hero card */}
      <div className="fade-up card" style={{ padding: '28px', overflow: 'hidden', position: 'relative' }}>
        {/* bg decoration */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,255,135,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={p.avatar_url} alt={p.username}
              style={{ width: '96px', height: '96px', borderRadius: '18px', border: '2px solid var(--green-border)' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {p.name || p.username}
              </h1>
              {p.hireable && <span className="badge badge-green">OPEN TO WORK</span>}
              {p.site_admin && <span className="badge badge-blue">GITHUB STAFF</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '12px' }}>
              @{p.username} · Joined {new Date(p.account_created_at).getFullYear()}
            </div>
            {p.bio && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '14px', maxWidth: '500px' }}>
                {p.bio}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
              {p.location && <span>📍 {p.location}</span>}
              {p.company && <span>🏢 {p.company}</span>}
              {p.email && <span>✉️ {p.email}</span>}
              {p.blog && (
                <a href={p.blog.startsWith('http') ? p.blog : `https://${p.blog}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>
                  🌐 {p.blog}
                </a>
              )}
              {p.twitter_username && <span>𝕏 @{p.twitter_username}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => dispatch(analyzeProfile(p.username))}
              disabled={analyzing}
              className="btn-ghost"
              style={{ textAlign: 'center' }}
            >
              {analyzing ? '⟳ Refreshing...' : '⟳ Re-analyze'}
            </button>
            <a
              href={p.github_url} target="_blank" rel="noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', textAlign: 'center', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
        <BigStat label="Repos" value={p.public_repos} color="var(--green)" />
        <BigStat label="Followers" value={p.followers} color="var(--blue)" />
        <BigStat label="Following" value={p.following} color="var(--text-2)" />
        <BigStat label="Total Stars" value={p.total_stars} color="#fbbf24" />
        <BigStat label="Total Forks" value={p.total_forks} color="var(--orange)" />
        <BigStat label="Public Gists" value={p.public_gists} color="var(--purple)" />
        <BigStat label="Days on GitHub" value={p.account_age_days} color="var(--pink)" />
        <BigStat label="Top Repo ★" value={p.most_starred_repo_stars} color="#fbbf24" />
      </div>

      {/* Charts */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Radar */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Profile Radar
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#9898b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Radar dataKey="value" stroke="var(--green)" fill="var(--green)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart for languages */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Language Distribution
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={LANG_COLORS[i] || '#555'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#9898b8' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: 'var(--text-3)', fontSize: '0.85rem' }}>No language data</div>
          )}
        </div>
      </div>

      {/* Language bars */}
      {p.top_languages?.length > 0 && (
        <div className="fade-up-3 card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
            Language Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {p.top_languages.map((l, i) => {
              const max = p.top_languages[0].repo_count;
              const pct = Math.round((l.repo_count / max) * 100);
              const color = LANG_COLORS[i] || '#888';
              return (
                <div key={l.language}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text)' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      {l.language}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {l.repo_count} repos · {pct}%
                    </span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most starred repo */}
      {p.most_starred_repo && (
        <div className="fade-up-3 card" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(0,255,135,0.05) 0%, var(--bg-2) 60%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Most Starred Repository
            </div>
            <a
              href={`${p.github_url}/${p.most_starred_repo}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}
            >
              {p.most_starred_repo} ↗
            </a>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>
              ★ {p.most_starred_repo_stars?.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Full details */}
      <div className="fade-up-4 card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '4px' }}>Full Details</h3>
        <MetricRow label="Username" value={p.username} />
        <MetricRow label="Display Name" value={p.name} />
        <MetricRow label="Email" value={p.email} color="var(--blue)" />
        <MetricRow label="Company" value={p.company} />
        <MetricRow label="Location" value={p.location} />
        <MetricRow label="Website" value={p.blog} color="var(--green)" />
        <MetricRow label="Twitter" value={p.twitter_username && `@${p.twitter_username}`} />
        <MetricRow label="Account Created" value={p.account_created_at && new Date(p.account_created_at).toDateString()} />
        <MetricRow label="GitHub Staff" value={p.site_admin ? 'Yes' : 'No'} />
        <MetricRow label="Hireable" value={p.hireable ? 'Yes' : 'No'} color={p.hireable ? 'var(--green)' : 'var(--text-2)'} />
        <MetricRow label="Last Analyzed" value={p.analyzed_at && new Date(p.analyzed_at).toLocaleString()} />
      </div>

      <Link to="/profiles" style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textDecoration: 'none', paddingBottom: '20px' }}>
        ← Back to all profiles
      </Link>
    </div>
  );
};

export default ProfileDetail;



// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams, Link } from 'react-router-dom';
// import { getSingleProfile, analyzeProfile } from '../redux/slices/githubSlice';

// const DetailRow = ({ label, value }) => {
//   if (!value && value !== 0) return null;
//   return (
//     <div className="flex items-start justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
//       <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//         {label}
//       </span>
//       <span className="text-sm font-medium text-right max-w-xs" style={{ color: '#e2e2f0' }}>
//         {String(value)}
//       </span>
//     </div>
//   );
// };

// const ProfileDetail = () => {
//   const { username } = useParams();
//   const dispatch = useDispatch();
//   const { currentProfile: p, loading, analyzing } = useSelector((state) => state.github);

//   useEffect(() => {
//     dispatch(getSingleProfile(username));
//   }, [username]);

//   const handleReanalyze = () => {
//     dispatch(analyzeProfile(username));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-32">
//         <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--acid-green)' }}>
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//         </svg>
//       </div>
//     );
//   }

//   if (!p) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-5xl mb-4">404</p>
//         <p className="font-semibold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>
//           Profile not found
//         </p>
//         <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
//           @{username} hasn't been analyzed yet.
//         </p>
//         <Link to="/" className="btn-primary inline-block mt-6 px-6 py-2 rounded-xl text-sm">
//           Analyze @{username}
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-8 max-w-3xl mx-auto">
//       {/* Breadcrumb */}
//       <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//         <Link to="/profiles" style={{ color: 'var(--acid-green)' }}>Profiles</Link>
//         <span>/</span>
//         <span>@{p.username}</span>
//       </div>

//       {/* Profile Header */}
//       <div
//         className="rounded-2xl p-6 border flex items-start gap-5"
//         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
//       >
//         <img
//           src={p.avatar_url}
//           alt={p.username}
//           className="w-24 h-24 rounded-2xl flex-shrink-0"
//           style={{ border: '2px solid var(--acid-green)' }}
//         />
//         <div className="flex-1">
//           <div className="flex items-start justify-between flex-wrap gap-3">
//             <div>
//               <h1 className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
//                 {p.name || p.username}
//               </h1>
//               <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//                 @{p.username}
//               </span>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleReanalyze}
//                 disabled={analyzing}
//                 className="text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50"
//                 style={{ background: 'rgba(181,255,58,0.1)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace', border: '1px solid rgba(181,255,58,0.2)' }}
//               >
//                 {analyzing ? '⟳ Refreshing...' : '⟳ Re-analyze'}
//               </button>
//               <a
//                 href={p.github_url}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-sm px-4 py-2 rounded-xl transition-all"
//                 style={{ background: 'var(--bg-dark)', color: '#e2e2f0', fontFamily: 'DM Mono, monospace', border: '1px solid var(--border)' }}
//               >
//                 GitHub ↗
//               </a>
//             </div>
//           </div>
//           {p.bio && (
//             <p className="mt-3 text-sm leading-relaxed" style={{ color: '#9a9ab0' }}>
//               {p.bio}
//             </p>
//           )}
//           <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
//             {p.location && <span>📍 {p.location}</span>}
//             {p.company && <span>🏢 {p.company}</span>}
//             {p.email && <span>✉️ {p.email}</span>}
//             {p.twitter_username && <span>🐦 @{p.twitter_username}</span>}
//             {p.hireable && <span style={{ color: 'var(--acid-green)' }}>✅ Open to work</span>}
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//         {[
//           { label: 'Public Repos', value: p.public_repos, icon: '📦' },
//           { label: 'Followers', value: p.followers, icon: '👥' },
//           { label: 'Following', value: p.following, icon: '➡️' },
//           { label: 'Public Gists', value: p.public_gists, icon: '📝' },
//           { label: 'Total Stars', value: p.total_stars, icon: '⭐' },
//           { label: 'Total Forks', value: p.total_forks, icon: '🍴' },
//           { label: 'Days on GitHub', value: p.account_age_days, icon: '📅' },
//           { label: 'Top Repo Stars', value: p.most_starred_repo_stars, icon: '🏆' },
//         ].map(({ label, value, icon }) => (
//           <div key={label} className="stat-card rounded-xl p-4">
//             <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//               {icon} {label}
//             </span>
//             <span className="text-2xl font-bold block mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>
//               {value?.toLocaleString() ?? '—'}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Most Starred Repo */}
//       {p.most_starred_repo && (
//         <div
//           className="rounded-xl p-5 flex items-center justify-between border"
//           style={{ background: 'rgba(181,255,58,0.04)', borderColor: 'rgba(181,255,58,0.2)' }}
//         >
//           <div>
//             <span className="text-xs block" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//               Most Starred Repository
//             </span>
//             <a
//               href={`${p.github_url}/${p.most_starred_repo}`}
//               target="_blank"
//               rel="noreferrer"
//               className="font-semibold mt-1 block hover:underline"
//               style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}
//             >
//               {p.most_starred_repo} ↗
//             </a>
//           </div>
//           <span className="text-4xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}>
//             ★ {p.most_starred_repo_stars?.toLocaleString()}
//           </span>
//         </div>
//       )}

//       {/* Top Languages */}
//       {p.top_languages?.length > 0 && (
//         <div
//           className="rounded-xl p-5 border"
//           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
//         >
//           <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
//             Top Languages
//           </h3>
//           <div className="flex flex-col gap-3">
//             {p.top_languages.map((l, i) => {
//               const max = p.top_languages[0].repo_count;
//               const pct = Math.round((l.repo_count / max) * 100);
//               return (
//                 <div key={l.language} className="flex items-center gap-3">
//                   <span
//                     className="text-xs w-4 text-right"
//                     style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
//                   >
//                     #{i + 1}
//                   </span>
//                   <span className="text-sm w-28 truncate" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--acid-green)' }}>
//                     {l.language}
//                   </span>
//                   <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
//                     <div
//                       className="h-2 rounded-full transition-all"
//                       style={{ width: `${pct}%`, background: 'var(--acid-green)' }}
//                     />
//                   </div>
//                   <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
//                     {l.repo_count}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Full Details */}
//       <div
//         className="rounded-xl p-5 border"
//         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
//       >
//         <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
//           Full Profile Details
//         </h3>
//         <DetailRow label="Username" value={p.username} />
//         <DetailRow label="Name" value={p.name} />
//         <DetailRow label="Email" value={p.email} />
//         <DetailRow label="Company" value={p.company} />
//         <DetailRow label="Location" value={p.location} />
//         <DetailRow label="Website" value={p.blog} />
//         <DetailRow label="Twitter" value={p.twitter_username && `@${p.twitter_username}`} />
//         <DetailRow label="Account Created" value={p.account_created_at && new Date(p.account_created_at).toDateString()} />
//         <DetailRow label="Site Admin" value={p.site_admin ? 'Yes' : 'No'} />
//         <DetailRow label="Hireable" value={p.hireable ? 'Yes' : 'No'} />
//         <DetailRow label="Last Analyzed" value={p.analyzed_at && new Date(p.analyzed_at).toLocaleString()} />
//       </div>

//       <Link
//         to="/profiles"
//         className="text-sm text-center py-3 block"
//         style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}
//       >
//         ← Back to all profiles
//       </Link>
//     </div>
//   );
// };

// export default ProfileDetail;
