import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          'http://localhost:5000/api/admin/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load users'
          );
        }

        setUsers(data.users || []);

      } catch (error) {
        console.error('Admin users error:', error);
        setError(error.message);

      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

  }, [token]);


  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });


  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
  };


  if (loading) {
    return (
      <div className="admin-loading">
        <div>👥</div>
        <h2>Loading Users...</h2>
      </div>
    );
  }


  return (
    <div className="admin-shell">

      {/* SIDEBAR */}

    <AdminSidebar activePage="users" />


      {/* MAIN CONTENT */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <span className="admin-page-label">
              USER MANAGEMENT
            </span>

            <h1>Registered Users</h1>

            <p>
              View Waste2Wealth users and their
              recycling activity.
            </p>
          </div>


          <div className="admin-topbar-badge">
            <span>●</span>
            {users.length} Users
          </div>

        </header>


        {/* SUMMARY CARDS */}

        <section className="admin-users-summary">

          <div className="admin-mini-stat">
            <span>👥</span>

            <div>
              <small>Total Users</small>
              <strong>{users.length}</strong>
            </div>
          </div>


          <div className="admin-mini-stat">
            <span>⭐</span>

            <div>
              <small>Total User Points</small>

              <strong>
                {users.reduce(
                  (total, user) =>
                    total + (user.points || 0),
                  0
                )}
              </strong>
            </div>
          </div>


          <div className="admin-mini-stat">
            <span>🚚</span>

            <div>
              <small>Total Pickups</small>

              <strong>
                {users.reduce(
                  (total, user) =>
                    total +
                    (user.activity?.totalPickups || 0),
                  0
                )}
              </strong>
            </div>
          </div>


          <div className="admin-mini-stat">
            <span>♻️</span>

            <div>
              <small>Completed Pickups</small>

              <strong>
                {users.reduce(
                  (total, user) =>
                    total +
                    (user.activity
                      ?.completedPickups || 0),
                  0
                )}
              </strong>
            </div>
          </div>

        </section>


        {/* USERS PANEL */}

        <section className="admin-panel admin-users-panel">

          <div className="admin-users-toolbar">

            <div>
              <span className="admin-page-label">
                PLATFORM MEMBERS
              </span>

              <h2>User Accounts</h2>
            </div>


            <div className="admin-user-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

          </div>


          {error ? (

            <div className="admin-users-error">
              {error}
            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="admin-empty">

              {search
                ? 'No users match your search.'
                : 'No registered users found.'
              }

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table admin-users-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Points</th>
                    <th>Pickups</th>
                    <th>Completed</th>
                    <th>Redemptions</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>


                <tbody>

                  {filteredUsers.map((user) => (

                    <tr key={user._id}>

                      <td>

                        <div className="admin-user-cell">

                          <div className="admin-user-avatar">

                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || 'U'
                            }

                          </div>


                          <div>

                            <strong>
                              {user.name}
                            </strong>

                            <small>
                              {user.email}
                            </small>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="admin-points-badge">
                          ⭐ {user.points || 0}
                        </span>

                      </td>


                      <td>
                        {user.activity
                          ?.totalPickups || 0}
                      </td>


                      <td>
                        {user.activity
                          ?.completedPickups || 0}
                      </td>


                      <td>
                        {user.activity
                          ?.totalRedemptions || 0}
                      </td>


                      <td>
                        {formatDate(
                          user.createdAt
                        )}
                      </td>


                      <td>

                        <span className="admin-account-active">
                          ● Active
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminUsers;
