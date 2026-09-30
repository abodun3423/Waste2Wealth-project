import { useNavigate } from 'react-router-dom';

function AccessPortal() {
  const navigate = useNavigate();

  return (
    <div className="access-page">
      <div className="access-container">

        <div className="access-header">
          <div className="access-logo">♻️</div>
          <h1>Waste2Wealth</h1>
          <p>
            Turn your recyclable waste into value while
            helping to build a cleaner environment.
          </p>
        </div>

        <div className="access-options">

          {/* USER ACCESS */}
          <div className="access-card">
            <div className="access-icon">👤</div>

            <h2>User</h2>

            <p>
              Request recycling pickups, track your waste,
              earn points and redeem rewards.
            </p>

            <button
              className="access-primary-btn"
              onClick={() => navigate('/login')}
            >
              Login as User
            </button>

            <button
              className="access-secondary-btn"
              onClick={() => navigate('/register')}
            >
              Create User Account
            </button>
          </div>

          {/* COMPANY ACCESS */}
          <div className="access-card">
            <div className="access-icon">🏢</div>

            <h2>Recycling Company</h2>

            <p>
              Receive pickup requests, manage collections
              and verify recyclable materials.
            </p>

            <button
              className="access-primary-btn"
              onClick={() => navigate('/company/login')}
            >
              Login as Company
            </button>

            <button
              className="access-secondary-btn"
              onClick={() => navigate('/company/register')}
            >
              Register Company
            </button>
          </div>

        </div>

        <div className="access-footer">
          <p>
            ♻️ Recycle more. Waste less. Earn rewards.
          </p>
        </div>

      </div>
    </div>
  );
}

export default AccessPortal;
