import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:5000/api/users/login',
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
        throw new Error(
          data.error || 'Login failed'
        );
      }

      // Only administrators can use this login page
      if (data.user?.role !== 'admin') {
        throw new Error(
          'This account does not have administrator access.'
        );
      }

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      navigate('/admin/dashboard');

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-login-page">

      <div className="admin-login-container">

        {/* LEFT SIDE */}

        <section className="admin-login-brand">

          <div className="admin-login-brand-content">

            <div className="admin-login-logo">
              ♻️
            </div>

            <span className="admin-login-label">
              WASTE2WEALTH
            </span>

            <h1>
              Administration
              <br />
              Portal
            </h1>

            <p>
              Manage users, recycling companies,
              pickup operations and platform
              performance from one secure dashboard.
            </p>

            <div className="admin-login-features">

              <span>
                ✓ Platform Management
              </span>

              <span>
                ✓ Recycling Operations
              </span>

              <span>
                ✓ Analytics & Monitoring
              </span>

            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="admin-login-form-side">

          <div className="admin-login-card">

            <div className="admin-login-card-icon">
              ♻️
            </div>

            <span className="admin-login-small-title">
              WASTE2WEALTH ADMIN
            </span>

            <h2>Admin Sign In</h2>

            <p className="admin-login-description">
              Sign in with your administrator
              account to continue.
            </p>


            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              <div className="admin-login-field">

                <label>Admin Email</label>

                <input
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>


              <div className="admin-login-field">

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

              </div>


              <button
                type="submit"
                className="admin-login-button"
                disabled={loading}
              >

                {loading
                  ? 'Signing in...'
                  : 'Sign In to Admin Portal'
                }

              </button>

            </form>


            <div className="admin-login-security">

              <span>🔒</span>

              <p>
                Authorized administrators only.
              </p>

            </div>


            <button
              type="button"
              className="admin-login-user-link"
              onClick={() => navigate('/')}
            >
              ← Return to User Login
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

export default AdminLogin;
