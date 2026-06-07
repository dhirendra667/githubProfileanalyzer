import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAllProfiles, deleteProfile, getStats } from '../redux/slices/githubSlice';

const LANG_COLORS = ['#00ff87', '#4f8ef7', '#a855f7', '#fb923c', '#f472b6'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        <div style={{ color: 'var(--text-2)', marginBottom: '2px' }}>{label}</div>
        <div style={{ color: 'var(--green)' }}>{payload[0]?.value?.toLocaleString()} followers</div>
      </div>
    );
  }
  return null;
};

const ProfileCard = ({ profile, onDelete }) => (
  <div className="profile-card">
    {/* Top color strip */}
    <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--green), var(--blue))' }} />

    <div style={{ padding: '20px' }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <img
          src={profile.avatar_url} alt={profile.username}
          style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid var(--border)', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.name || profile.username}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '2px' }}>
            @{profile.username}
          </div>
          {profile.location && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>
              📍 {profile.location}
            </div>
          )}
        </div>
      </div>

      {/* 3 stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Repos', value: profile.public_repos, color: 'var(--green)' },
          { label: 'Followers', value: profile.followers, color: 'var(--blue)' },
          { label: 'Stars', value: profile.total_stars, color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color, lineHeight: 1 }}>
              {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      {profile.top_languages?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {profile.top_languages.slice(0, 3).map((l, i) => (
            <span key={l.language} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: '99px', padding: '3px 10px', color: 'var(--text-2)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: LANG_COLORS[i], flexShrink: 0 }} />
              {l.language}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          {new Date(profile.analyzed_at).toLocaleDateString()}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onDelete(profile.username)}
            style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '7px', border: '1px solid rgba(255,100,100,0.15)', background: 'rgba(255,100,100,0.06)', color: '#f87171', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          >
            Delete
          </button>
          <Link to={`/profiles/${profile.username}`} style={{
            fontSize: '0.7rem', padding: '4px 12px', borderRadius: '7px',
            background: 'var(--green-dim)', border: '1px solid var(--green-border)',
            color: 'var(--green)', fontFamily: 'var(--font-mono)', textDecoration: 'none',
          }}>
            View →
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const StatSummaryCard = ({ label, value, sub }) => (
  <div className="stat-card">
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', color: 'var(--green)', lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const ProfileList = () => {
  const dispatch = useDispatch();
  const { profiles, loading, pagination, stats } = useSelector((s) => s.github);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getAllProfiles({ page, limit: 9 }));
    dispatch(getStats());
  }, [page]);

  const handleDelete = (username) => {
    if (window.confirm(`Delete @${username}?`)) dispatch(deleteProfile(username));
  };

  const barData = stats?.top_by_followers?.map((u) => ({
    name: u.username,
    followers: u.followers,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '6px' }}>
            Analyzed Profiles
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {pagination.total || 0} profiles stored in database
          </p>
        </div>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '10px 20px' }}>
          + Analyze New
        </Link>
      </div>

      {/* Stats summary */}
      {stats?.summary && (
        <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          <StatSummaryCard label="Total Analyzed" value={stats.summary.total_profiles_analyzed} />
          <StatSummaryCard label="Max Followers" value={Number(stats.summary.max_followers).toLocaleString()} />
          <StatSummaryCard label="Avg Followers" value={Math.round(stats.summary.avg_followers).toLocaleString()} />
          <StatSummaryCard label="Max Stars" value={Number(stats.summary.max_stars).toLocaleString()} />
          <StatSummaryCard label="Avg Stars" value={Math.round(stats.summary.avg_stars).toLocaleString()} />
          <StatSummaryCard label="Avg Repos" value={Math.round(stats.summary.avg_repos)} />
        </div>
      )}

      {/* Bar chart — top by followers */}
      {barData.length > 1 && (
        <div className="fade-up-2 card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
            Top Profiles by Followers
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#9898b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="followers" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#00ff87' : `rgba(0,255,135,${0.5 - i * 0.08})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Profiles grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ height: '260px', borderRadius: '16px' }} className="skeleton" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No profiles yet</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '24px' }}>Analyze a GitHub profile to get started</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Analyze Now</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost"
          >
            ← Prev
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {page} / {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileList;


