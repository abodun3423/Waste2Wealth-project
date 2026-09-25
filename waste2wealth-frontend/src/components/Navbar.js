import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!token) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">♻️</div>

        <div>
          <h2>Waste2Wealth</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          Marketplace
        </NavLink>

        <NavLink
          to="/rewards"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          Rewards
        </NavLink>

        <NavLink
          to="/companies"
          className={({ isActive }) =>
           `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          Recycling Companies
        </NavLink>

        <NavLink
          to="/my-pickups"
          className={({ isActive }) =>
           `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          My Pickups
        </NavLink>
      </nav>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>

      {user && (
        <div
          style={{
            marginTop: '30px',
            padding: '12px',
            fontSize: '13px',
            opacity: 0.85
          }}
        >
          Logged in as
          <br />
          <strong>{user.name}</strong>
        </div>
      )}
    </aside>
  );
}

export default Navbar;
