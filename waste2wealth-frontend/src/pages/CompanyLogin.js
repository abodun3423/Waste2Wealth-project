import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login-recycling.jpg';

function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/company-auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || 'Company login failed'
        );
        return;
      }

      // Keep company authentication separate
      // from normal user authentication.
      localStorage.setItem(
        'companyToken',
        data.token
      );

      localStorage.setItem(
        'company',
        JSON.stringify(data.company)
      );

      navigate('/company/dashboard');

    } catch (error) {
      console.error(
        'Company login error:',
        error
      );

      setMessage(
        'Unable to connect to backend'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div
        className="login-visual"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(5, 70, 45, 0.76),
              rgba(5, 70, 45, 0.76)
            ),
            url(${loginImage})
          `
        }}
      >
        <div className="login-visual-content">

          <div className="login-logo">
            ♻️
          </div>

          <h1>Waste2Wealth</h1>

          <h2>Recycling Partner Portal</h2>

          <p>
            Manage recycling pickups, collections
            and verified recyclable materials from
            one place.
          </p>

        </div>
      </div>

      <div className="login-panel">

        <div className="login-card card">

          <div className="login-mobile-brand">
            ♻️ Waste2Wealth
          </div>

          <h2>Company Login</h2>

          <p className="login-description">
            Sign in to your recycling company account.
          </p>

          <form onSubmit={handleSubmit}>

            <label className="form-label">
              Company Email
            </label>

            <input
              className="input"
              type="email"
              placeholder="Enter company email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label className="form-label">
              Password
            </label>

            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="primary-button login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Signing In...'
                : 'Sign In as Company'}
            </button>

          </form>

          {message && (
            <p className="error-message">
              {message}
            </p>
          )}

          <div
            style={{
              textAlign: 'center',
              marginTop: '20px'
            }}
          >
            Don't have a company account?{' '}

            <button
              type="button"
              onClick={() =>
                navigate('/company/register')
              }
              style={{
                border: 'none',
                background: 'none',
                color: '#15803d',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Register Company
            </button>
          </div>

          <div className="login-footer">
            <span>♻️</span>
            Waste2Wealth Recycling Partner
          </div>

        </div>

      </div>

    </div>
  );
}

export default CompanyLogin;
