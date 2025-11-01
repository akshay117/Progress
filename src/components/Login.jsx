import React, { useState } from 'react';
import { TextInput, Button, InlineNotification, Theme } from '@carbon/react';
import { authAPI } from '../services/api';
import './Login.scss';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.login(username, password);
      onLoginSuccess(result.user);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme theme="white">
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">WeCare Insurance Portal</h1>
              <p className="login-subtitle">Sign in to manage insurance records</p>
            </div>

            {error && (
              <InlineNotification
                kind="error"
                title="Login Failed"
                subtitle={error}
                onCloseButtonClick={() => setError('')}
                className="login-error"
                lowContrast
              />
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <TextInput
                id="username"
                labelText="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />

              <TextInput
                id="password"
                type="password"
                labelText="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                className="login-button"
                size="lg"
                disabled={loading || !username || !password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Theme>
  );
};

export default Login;
