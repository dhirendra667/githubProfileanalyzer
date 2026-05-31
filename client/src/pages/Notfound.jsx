import { Link } from 'react-router-dom';

const Notfound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <span className="text-8xl font-black gradient-text" style={{ fontFamily: 'Syne, sans-serif' }}>
        404
      </span>
      <p className="text-xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
        Page Not Found
      </p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary mt-4 px-6 py-2 rounded-xl text-sm">
        Go Home
      </Link>
    </div>
  );
};

export default Notfound;
