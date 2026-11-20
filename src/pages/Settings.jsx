import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import authApi from '../api/auth.api';
import { useAuth } from '../context/useAuth';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authApi.getMe();
        setUser(res);
        setName(res?.name || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.updateMe({ name });
      setUser(res);
      setMsg('Saved successfully');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to save');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <PageWrapper title="Settings"><Spinner /></PageWrapper>;

  return (
    <PageWrapper title="Settings">
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0 }}>Your Profile</h3>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ width: '100%', padding: '8px', background: '#f5f5f5' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Role</label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              style={{ width: '100%', padding: '8px', background: '#f5f5f5' }}
            />
          </div>

          <Button type="submit" variant="primary">Save</Button>

          {msg && <span style={{ color: '#10b981', marginLeft: '10px' }}>{msg}</span>}
        </form>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <Button variant="danger" onClick={handleLogout} style={{ padding: '10px 20px' }}>Logout</Button>
      </div>
    </PageWrapper>
  );
};

export default Settings;
