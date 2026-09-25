import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5000/api/admin/analytics',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load analytics'
        );
      }

      setAnalytics(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar activePage="analytics" />

        <main className="admin-main">
          <div className="admin-analytics-message">
            Loading analytics...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar activePage="analytics" />

        <main className="admin-main">
          <div className="admin-companies-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    overview,
    companies,
    pickups,
    recycling,
    redemptions,
    recentActivity
  } = analytics;

  return (
    <div className="admin-shell">

      <AdminSidebar activePage="analytics" />

      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">
              PLATFORM INSIGHTS
            </p>

            <h1>Analytics</h1>

            <p>
              Monitor Waste2Wealth platform activity,
              recycling performance and reward usage.
            </p>
          </div>

          <div className="admin-topbar-badge">
            Administrator
          </div>
        </header>


        {/* OVERVIEW */}

        <section className="analytics-overview">

          <div className="analytics-card">
            <span>Total Users</span>
            <strong>{overview.totalUsers}</strong>
            <small>Registered users</small>
          </div>

          <div className="analytics-card">
            <span>Recycling Companies</span>
            <strong>{overview.totalCompanies}</strong>
            <small>Companies on platform</small>
          </div>

          <div className="analytics-card">
            <span>Total Pickups</span>
            <strong>{overview.totalPickups}</strong>
            <small>Pickup requests created</small>
          </div>

          <div className="analytics-card">
            <span>Redemptions</span>
            <strong>{overview.totalRedemptions}</strong>
            <small>Reward requests</small>
          </div>

        </section>


        {/* RECYCLING IMPACT */}

        <section className="analytics-impact">

          <div>
            <span>Verified Recycled</span>

            <strong>
              {Number(
                recycling.totalVerifiedWeightKg || 0
              ).toFixed(1)} kg
            </strong>

            <small>Total verified recycling weight</small>
          </div>

          <div>
            <span>Average Pickup Weight</span>

            <strong>
              {Number(
                recycling.averageVerifiedWeightKg || 0
              ).toFixed(2)} kg
            </strong>

            <small>Average completed pickup</small>
          </div>

          <div>
            <span>Points Awarded</span>

            <strong>
              {recycling.totalPointsAwarded || 0}
            </strong>

            <small>Recycling reward points</small>
          </div>

          <div>
            <span>Points Redeemed</span>

            <strong>
              {redemptions.totalPointsRedeemed || 0}
            </strong>

            <small>Completed reward redemptions</small>
          </div>

        </section>


        {/* PERFORMANCE */}

        <section className="analytics-grid">

          <div className="analytics-panel">

            <div className="analytics-panel-header">
              <div>
                <h2>Pickup Performance</h2>
                <p>Current pickup status distribution</p>
              </div>

              <strong>
                {pickups.completionRate}%
              </strong>
            </div>

            <div className="analytics-progress">
              <div
                className="analytics-progress-fill"
                style={{
                  width: `${Math.min(
                    pickups.completionRate || 0,
                    100
                  )}%`
                }}
              />
            </div>

            <div className="analytics-stat-list">

              <div>
                <span>Total</span>
                <strong>{pickups.total}</strong>
              </div>

              <div>
                <span>Pending</span>
                <strong>{pickups.pending}</strong>
              </div>

              <div>
                <span>Accepted</span>
                <strong>{pickups.accepted}</strong>
              </div>

              <div>
                <span>Collected</span>
                <strong>{pickups.collected}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>{pickups.completed}</strong>
              </div>

              <div>
                <span>Cancelled</span>
                <strong>{pickups.cancelled}</strong>
              </div>

            </div>
          </div>


          <div className="analytics-panel">

            <div className="analytics-panel-header">
              <div>
                <h2>Company Verification</h2>
                <p>Recycling company verification</p>
              </div>

              <strong>
                {companies.verificationRate}%
              </strong>
            </div>

            <div className="analytics-progress">
              <div
                className="analytics-progress-fill"
                style={{
                  width: `${Math.min(
                    companies.verificationRate || 0,
                    100
                  )}%`
                }}
              />
            </div>

            <div className="analytics-stat-list">

              <div>
                <span>Total Companies</span>
                <strong>{companies.total}</strong>
              </div>

              <div>
                <span>Verified</span>
                <strong>{companies.verified}</strong>
              </div>

              <div>
                <span>Unverified</span>
                <strong>{companies.unverified}</strong>
              </div>

            </div>
          </div>

        </section>


        {/* REDEMPTION PERFORMANCE */}

        <section className="analytics-panel analytics-redemption-panel">

          <div className="analytics-panel-header">
            <div>
              <h2>Reward Activity</h2>
              <p>
                Overview of reward redemption activity
              </p>
            </div>
          </div>

          <div className="analytics-stat-list analytics-reward-stats">

            <div>
              <span>Total</span>
              <strong>{redemptions.total}</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>{redemptions.pending}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{redemptions.completed}</strong>
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{redemptions.cancelled}</strong>
            </div>

            <div>
              <span>Points Redeemed</span>
              <strong>
                {redemptions.totalPointsRedeemed}
              </strong>
            </div>

          </div>
        </section>


        {/* RECENT ACTIVITY */}

        <section className="analytics-recent">

          <div className="analytics-panel">

            <div className="analytics-panel-header">
              <div>
                <h2>Recent Pickups</h2>
                <p>Latest pickup requests</p>
              </div>
            </div>

            {recentActivity.pickups.length === 0 ? (
              <div className="admin-analytics-message">
                No pickup activity yet.
              </div>
            ) : (
              <div className="analytics-activity-list">

                {recentActivity.pickups.map((pickup) => (
                  <div
                    className="analytics-activity-item"
                    key={pickup._id}
                  >

                    <div>
                      <strong>
                        {pickup.user?.name ||
                          'Unknown User'}
                      </strong>

                      <span>
                        {pickup.material} •{' '}
                        {pickup.company?.companyName ||
                          'Unknown Company'}
                      </span>
                    </div>

                    <span
                      className={`pickup-admin-status ${pickup.status}`}
                    >
                      {pickup.status}
                    </span>

                  </div>
                ))}

              </div>
            )}
          </div>


          <div className="analytics-panel">

            <div className="analytics-panel-header">
              <div>
                <h2>Recent Redemptions</h2>
                <p>Latest reward requests</p>
              </div>
            </div>

            {recentActivity.redemptions.length === 0 ? (
              <div className="admin-analytics-message">
                No redemption activity yet.
              </div>
            ) : (
              <div className="analytics-activity-list">

                {recentActivity.redemptions.map(
                  (redemption) => (
                    <div
                      className="analytics-activity-item"
                      key={redemption._id}
                    >

                      <div>
                        <strong>
                          {redemption.user?.name ||
                            'Unknown User'}
                        </strong>

                        <span>
                          {redemption.rewardName} •{' '}
                          {redemption.pointsSpent} points
                        </span>
                      </div>

                      <span
                        className={`redemption-status ${redemption.status}`}
                      >
                        {redemption.status}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default AdminAnalytics;
