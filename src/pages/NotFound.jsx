import { Link } from 'react-router-dom';

// simple 404 page shown for any route that doesnt exist
const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#0f172a',
    color: '#e2e8f0',
    fontFamily: 'Inter, sans-serif'
  }}>
    <h1 style={{ fontSize: '64px', margin: 0 }}>404</h1>
    <p style={{ margin: 0, color: '#94a3b8' }}>This page does not exist.</p>
    <Link to="/" style={{ color: '#38bdf8', marginTop: '8px' }}>
      Go back to the dashboard
    </Link>
  </div>
);

export default NotFound;
