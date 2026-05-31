import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            <span style={{ color: 'var(--acid-green)' }}>GitHub</span>
            <span style={{ color: '#e2e2f0' }}>Analyzer</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: isActive('/') ? 'var(--acid-green)' : 'var(--text-muted)',
              background: isActive('/') ? 'rgba(181,255,58,0.08)' : 'transparent',
            }}
          >
            Analyze
          </Link>
          <Link
            to="/profiles"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: isActive('/profiles') ? 'var(--acid-green)' : 'var(--text-muted)',
              background: isActive('/profiles') ? 'rgba(181,255,58,0.08)' : 'transparent',
            }}
          >
            All Profiles
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
