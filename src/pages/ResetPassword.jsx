import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authApi from '../api/auth.api';
import './login.css';

export default function ResetPassword() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await authApi.resetPassword({ token, password });
      setSuccess(result.message || 'Password updated. Please sign in.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password. Request a new link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-box">
          <h1 className="login-title">Choose a new password</h1>
          <p className="login-subtitle">Use at least 8 characters. The reset link expires after 10 minutes.</p>
          {error && <div className="alert error-alert" role="alert">{error}</div>}
          {success && <div className="alert success-alert" role="status">{success}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button type="submit" className={`submit-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
          <p className="register-prompt"><Link to="/login">Return to sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
