import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const items = [
    { path: '/', label: 'Dashboard' },
    { path: '/devices', label: 'Devices' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/alerts/rules', label: 'Alert Rules' },
    { path: '/history', label: 'History' },
    { path: '/settings', label: 'Settings' }
  ];

  const handleLogout = async () => {
    // call the backend so the token gets blacklisted, then go to login
    await logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
        <img src="/logo.svg" alt="IoT83 Logo" style={{ height: '32px' }} />
      </div>
      <div className="sidebar-menu">
        {items.map(item => (
          <div
            key={item.path}
            className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer', marginBottom: '6px' }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <button className="sidebar-logout-btn" onClick={handleLogout}>Secure Logout</button>
    </div>
  );
};

export default Sidebar;
