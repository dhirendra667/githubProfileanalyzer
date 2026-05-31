import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllProfiles, deleteProfile, getStats } from '../redux/slices/githubSlice';

const ProfileCard = ({ profile, onDelete }) => (
  <div className="profile-card rounded-xl p-5 flex flex-col gap-3">
    <div className="flex items-start gap-3">
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        style={{ border: '1px solid var(--border)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e2f0' }}>
            {profile.name || profile.username}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
          @{profile.username}
        </span>
        {profile.location && (
          <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>
            📍 {profile.location}
          </span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 text-center">
      {[
        { label: 'Repos', value: profile.public_repos },
        { label: 'Followers', value: profile.followers },
        { label: 'Stars', value: profile.total_stars },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="rounded-lg py-2 px-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
        >
          <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}>
            {value?.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            {label}
          </div>
        </div>
      ))}
    </div>

    {profile.top_languages?.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {profile.top_languages.slice(0, 3).map((l) => (
          <span
            key={l.language}
            className="lang-pill text-xs px-2 py-0.5 rounded-full"
          >
            {l.language}
          </span>
        ))}
      </div>
    )}

    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
        {new Date(profile.analyzed_at).toLocaleDateString()}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onDelete(profile.username)}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.08)', fontFamily: 'DM Mono, monospace' }}
        >
          Delete
        </button>
        <Link
          to={`/profiles/${profile.username}`}
          className="text-xs px-3 py-1 rounded transition-all"
          style={{ background: 'rgba(181,255,58,0.1)', color: 'var(--acid-green)', fontFamily: 'DM Mono, monospace' }}
        >
          View →
        </Link>
      </div>
    </div>
  </div>
);

const ProfileList = () => {
  const dispatch = useDispatch();
  const { profiles, loading, pagination, stats } = useSelector((state) => state.github);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getAllProfiles({ page, limit: 9 }));
    dispatch(getStats());
  }, [page]);

  const handleDelete = (username) => {
    if (window.confirm(`Delete profile @${username}?`)) {
      dispatch(deleteProfile(username));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
            Analyzed Profiles
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {pagination.total || 0} profiles stored in database
          </p>
        </div>
        <Link to="/" className="btn-primary px-4 py-2 rounded-xl text-sm">
          + Analyze New
        </Link>
      </div>

      {/* Stats Summary */}
      {stats?.summary && (
        <div
          className="rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          {[
            { label: 'Total Analyzed', value: stats.summary.total_profiles_analyzed },
            { label: 'Max Followers', value: Number(stats.summary.max_followers)?.toLocaleString() },
            { label: 'Avg Followers', value: Math.round(stats.summary.avg_followers)?.toLocaleString() },
            { label: 'Max Stars', value: Number(stats.summary.max_stars)?.toLocaleString() },
            { label: 'Avg Stars', value: Math.round(stats.summary.avg_stars)?.toLocaleString() },
            { label: 'Avg Repos', value: Math.round(stats.summary.avg_repos) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                {label}
              </div>
              <div className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--acid-green)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--acid-green)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : profiles.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>No profiles analyzed yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Go to the home page and analyze a GitHub profile
          </p>
          <Link to="/" className="btn-primary inline-block mt-4 px-6 py-2 rounded-xl text-sm">
            Analyze Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#e2e2f0' }}
          >
            ← Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#e2e2f0' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileList;
