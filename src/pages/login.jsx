import { useState } from 'react';
import axios from 'axios';
import './login.css';

const Auth = () => {
  const [mode, setMode] = useState('LOGIN'); // fro 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const API_URL = 'http://localhost:5001/api/auth';

    try {
      if (mode === 'LOGIN') {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        localStorage.setItem('token', res.data.data.token);
        setSuccessMsg("Authentication Successful. Secure Handshake Active.");
      } else if (mode === 'REGISTER') {
        const res = await axios.post(`${API_URL}/register`, { name, email, password });
        localStorage.setItem('token', res.data.data.token);
        setSuccessMsg("Registration Complete. Welcome to IoT Dashboard.");
      } else if (mode === 'FORGOT_PASSWORD') {
        const res = await axios.post(`${API_URL}/forgot-password`, { email });
        setSuccessMsg(res.data.message || "Reset link dispatched.");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'A strict network logic error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box glass-card">
        
        <div className="logo-container">
          <img 
            src="/logo.svg" 
            alt="IoT83 Logo" 
            className="logo"
            onError={(e) => {
              e.target.style.display = 'none'; // Native render fallback
            }}
          />
        </div>

        <h2 className="login-title">
          {mode === 'LOGIN' && "Sign in to Dashboard"}
          {mode === 'REGISTER' && "Initialize User Account"}
          {mode === 'FORGOT_PASSWORD' && "Initialize Password Recovery"}
        </h2>
        <p className="login-subtitle">
          {mode === 'LOGIN' && "Enter your active credentials to securely monitor infrastructure."}
          {mode === 'REGISTER' && "Register dynamically to securely monitor internal edge devices."}
          {mode === 'FORGOT_PASSWORD' && "Enter your active email to natively receive a secure tracking reset link."}
        </p>

        {error && <div className="alert error-alert">{error}</div>}
        {successMsg && <div className="alert success-alert" style={{backgroundColor: '#e6ffe6', color: '#006600', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #006600', fontSize: '14px', textAlign: 'center'}}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'REGISTER' && (
            <div className="input-group">
              <label htmlFor="name">System Operator Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aditya Jain"
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Operator Work Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aditya.jain@iot83.com"
              required
            />
          </div>

          {mode !== 'FORGOT_PASSWORD' && (
            <div className="input-group">
              <div className="password-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <label htmlFor="password">Administrator Password</label>
                {mode === 'LOGIN' && (
                  <button 
                    type="button" 
                    className="forgot-password-link" 
                    onClick={() => { setMode('FORGOT_PASSWORD'); clearForm(); }}
                    style={{background: 'none', border: 'none', color: '#333', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline'}}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              mode === 'LOGIN' ? 'Execute Secure Login' :
              mode === 'REGISTER' ? 'Register Account Profile' :
              'Transmit Secure Reset Link'
            )}
          </button>
        </form>

        <div className="register-prompt">
          {mode === 'LOGIN' ? (
            <p className="no-account-text">
              Unrecognized Operator?{' '}
              <button className="register-link" onClick={() => { setMode('REGISTER'); clearForm(); }}>Initialize Sign up</button>
            </p>
          ) : (
            <p className="no-account-text">
              Active Authorized Operator?{' '}
              <button className="register-link" onClick={() => { setMode('LOGIN'); clearForm(); }}>Execute Log in</button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;
