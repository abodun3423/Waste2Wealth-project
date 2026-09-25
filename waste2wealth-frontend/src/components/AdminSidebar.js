import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminSidebar({ activePage }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">

      <div className="admin-brand">
        <div className="admin-brand-icon">♻️</div>

        <div>
          <h2>Waste2Wealth</h2>
          <span>Admin Portal</span>
        </div>
      </div>

      <nav className="admin-nav">

        <button
          className={activePage === 'dashboard' ? 'active' : ''}
          onClick={() => navigate('/admin/dashboard')}
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          className={activePage === 'users' ? 'active' : ''}
          onClick={() => navigate('/admin/users')}
        >
          <span>♙</span>
          Users
        </button>

        <button
          className={activePage === 'companies' ? 'active' : ''}
          onClick={() => navigate('/admin/companies')}
        >
          <span>▣</span>
          Companies
        </button>

        <button
          className={activePage === 'pickups' ? 'active' : ''}
          onClick={() => navigate('/admin/pickups')}
        >
          <span>♻</span>
          Pickups
        </button>

        <button
          className={activePage === 'redemptions' ? 'active' : ''}
          onClick={() => navigate('/admin/redemptions')}
        >
          <span>◆</span>
          Redemptions
        </button>

        <button
          className={activePage === 'analytics' ? 'active' : ''}
          onClick={() => navigate('/admin/analytics')}
        >
          <span>▥</span>
          Analytics
        </button>

      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </div>

    </aside>
  );
}

export default AdminSidebar;
