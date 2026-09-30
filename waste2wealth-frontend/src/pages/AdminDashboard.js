import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminDashboard() {


  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'http://localhost:5000/api/admin/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            'Failed to load admin dashboard'
          );
        }

        setDashboard(data);

      } catch (error) {
        console.error(
          'Admin dashboard error:',
          error
        );

        setError(error.message);

      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, [token]);




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


  if (loading) {
    return (
      <div className="admin-loading">
        <div>♻️</div>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }


  if (error) {
    return (
      <div className="admin-loading">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }


  const stats = dashboard?.statistics;

  return (
    <div className="admin-shell">

      {/* SIDEBAR */}

     <AdminSidebar activePage="dashboard" />


      {/* MAIN */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div>
            <span className="admin-page-label">
              ADMINISTRATION
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Monitor Waste2Wealth platform activity
              and recycling performance.
            </p>
          </div>


          <div className="admin-topbar-badge">
            <span>●</span>
            System Online
          </div>

        </header>


        {/* STATISTICS */}

        <section className="admin-stat-grid">

          <div className="admin-stat-card">

            <div className="admin-stat-icon users">
              👥
            </div>

            <div>
              <span>Total Users</span>

              <strong>
                {stats?.users?.total || 0}
              </strong>

              <small>
                Registered platform users
              </small>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon companies">
              🏢
            </div>

            <div>
              <span>Companies</span>

              <strong>
                {stats?.companies?.total || 0}
              </strong>

              <small>
                {stats?.companies?.verified || 0}
                {' '}verified
              </small>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon pickups">
              🚚
            </div>

            <div>
              <span>Total Pickups</span>

              <strong>
                {stats?.pickups?.total || 0}
              </strong>

              <small>
                {stats?.pickups?.pending || 0}
                {' '}pending
              </small>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon recycling">
              ♻️
            </div>

            <div>
              <span>Recycled Weight</span>

              <strong>
                {stats?.recycling
                  ?.totalVerifiedWeightKg || 0}
                {' '}kg
              </strong>

              <small>
                Verified materials
              </small>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon points">
              ⭐
            </div>

            <div>
              <span>Points Awarded</span>

              <strong>
                {stats?.recycling
                  ?.totalPointsAwarded || 0}
              </strong>

              <small>
                Recycling reward points
              </small>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon rewards">
              🎁
            </div>

            <div>
              <span>Redemptions</span>

              <strong>
                {stats?.redemptions?.total || 0}
              </strong>

              <small>
                {stats?.redemptions?.pending || 0}
                {' '}pending
              </small>
            </div>

          </div>

        </section>


        {/* SECOND ROW */}

        <section className="admin-dashboard-row">

          {/* PICKUP STATUS */}

          <div className="admin-panel">

            <div className="admin-panel-heading">
              <div>
                <span>PICKUP OPERATIONS</span>
                <h2>Pickup Status</h2>
              </div>
            </div>


            <div className="admin-status-list">

              <div>
                <span>
                  <i className="status-dot pending" />
                  Pending
                </span>

                <strong>
                  {stats?.pickups?.pending || 0}
                </strong>
              </div>


              <div>
                <span>
                  <i className="status-dot accepted" />
                  Accepted
                </span>

                <strong>
                  {stats?.pickups?.accepted || 0}
                </strong>
              </div>


              <div>
                <span>
                  <i className="status-dot collected" />
                  Collected
                </span>

                <strong>
                  {stats?.pickups?.collected || 0}
                </strong>
              </div>


              <div>
                <span>
                  <i className="status-dot completed" />
                  Completed
                </span>

                <strong>
                  {stats?.pickups?.completed || 0}
                </strong>
              </div>


              <div>
                <span>
                  <i className="status-dot cancelled" />
                  Cancelled
                </span>

                <strong>
                  {stats?.pickups?.cancelled || 0}
                </strong>
              </div>

            </div>

          </div>


          {/* COMPANY STATUS */}

          <div className="admin-panel">

            <div className="admin-panel-heading">

              <div>
                <span>PARTNER NETWORK</span>
                <h2>Company Verification</h2>
              </div>

            </div>


            <div className="admin-company-overview">

              <div className="admin-company-number verified">

                <strong>
                  {stats?.companies?.verified || 0}
                </strong>

                <span>
                  ✓ Verified Companies
                </span>

              </div>


              <div className="admin-company-number waiting">

                <strong>
                  {stats?.companies?.unverified || 0}
                </strong>

                <span>
                  ⏳ Awaiting Verification
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* RECENT PICKUPS */}

        <section className="admin-panel admin-recent-panel">

          <div className="admin-panel-heading">

            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Recent Pickup Requests</h2>
            </div>

          </div>


          {dashboard?.recentPickups?.length === 0 ? (

            <div className="admin-empty">
              No pickup requests yet.
            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Company</th>
                    <th>Material</th>
                    <th>Weight</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>


                <tbody>

                  {dashboard?.recentPickups?.map(
                    (pickup) => (

                      <tr key={pickup._id}>

                        <td>

                          <strong>
                            {pickup.user?.name ||
                              'Unknown User'}
                          </strong>

                          <small>
                            {pickup.user?.email || ''}
                          </small>

                        </td>


                        <td>
                          {pickup.company?.companyName ||
                            'Unknown Company'}
                        </td>


                        <td>
                          {pickup.material}
                        </td>


                        <td>
                          {pickup.status === 'completed'
                            ? `${pickup.verifiedWeight || 0} kg`
                            : `${pickup.estimatedWeight || 0} kg`
                          }
                        </td>


                        <td>
                          {formatDate(
                            pickup.createdAt
                          )}
                        </td>


                        <td>

                          <span
                            className={
                              `admin-table-status ${pickup.status}`
                            }
                          >
                            {pickup.status}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
