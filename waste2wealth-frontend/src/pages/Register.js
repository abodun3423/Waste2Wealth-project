import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login-recycling.jpg';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:5000/api/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || 'Unable to create account'
        );
        return;
      }

      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Unable to connect to backend');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div
        className="login-visual"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(5, 70, 45, 0.72),
              rgba(5, 70, 45, 0.72)
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

          <h2>Start Your Recycling Journey</h2>

          <p>
            Create an account, request recycling pickups,
            earn points and turn recyclable waste into value.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-panel">

        <div className="login-card card">

          <div className="login-mobile-brand">
            ♻️ Waste2Wealth
          </div>

          <h2>Create Account</h2>

          <p className="login-description">
            Join Waste2Wealth and start earning rewards
            from recyclable waste.
          </p>

          <form onSubmit={handleSubmit}>

            <label className="form-label">
              Full Name
            </label>

            <input
              className="input"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

            <label className="form-label">
              Email Address
            </label>

            <input
              className="input"
              type="email"
              placeholder="Enter your email"
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <label className="form-label">
              Confirm Password
            </label>

            <input
              className="input"
              type="password"
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            <button
              className="primary-button login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
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
            Already have an account?{' '}

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                border: 'none',
                background: 'none',
                color: '#15803d',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>

          <div className="login-footer">
            <span>♻️</span>
            Recycling today for a better tomorrow.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;
