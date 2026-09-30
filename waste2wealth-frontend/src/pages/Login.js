import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login-recycling.jpg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/users/login',
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
        setMessage(data.error || 'Login failed');
        return;
      }

      // Save JWT token
      localStorage.setItem('token', data.token);

      // Save user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setMessage('Unable to connect to backend');
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE - BACKGROUND IMAGE */}
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

          <h2>Turn Waste Into Value</h2>

          <p>
            Recycle smarter, earn rewards and help build
            a cleaner and more sustainable environment.
          </p>

        </div>
      </div>


      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="login-panel">

        <div className="login-card card">

          <div className="login-mobile-brand">
            ♻️ Waste2Wealth
          </div>

          <h2>Welcome Back</h2>

          <p className="login-description">
            Sign in to continue your recycling journey.
          </p>

          <form onSubmit={handleSubmit}>

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
            >
              Sign In
            </button>

          </form>

          {message && (
            <p className="error-message">
              {message}
            </p>
          )}

          <div className="login-footer">
            <span>♻️</span>
            Recycling today for a better tomorrow.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
