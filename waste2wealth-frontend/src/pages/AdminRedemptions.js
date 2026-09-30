import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);

  const [summary, setSummary] = useState({
    totalRedemptions: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalPointsSpent: 0
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/admin/redemptions',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load redemptions'
        );
      }

      setRedemptions(data.redemptions || []);
      setSummary(data.summary || {});

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      const text = search.toLowerCase();

      const matchesSearch =
        redemption.user?.name
          ?.toLowerCase()
          .includes(text) ||
        redemption.user?.email
          ?.toLowerCase()
          .includes(text) ||
        redemption.rewardName
          ?.toLowerCase()
          .includes(text);

      const matchesStatus =
        statusFilter === 'all' ||
        redemption.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [redemptions, search, statusFilter]);

  return (
    <div className="admin-shell">

      <AdminSidebar activePage="redemptions" />

      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">
              REWARD MANAGEMENT
            </p>

            <h1>Redemptions</h1>

            <p>
              Monitor reward redemption requests across
              Waste2Wealth.
            </p>
          </div>

          <div className="admin-topbar-badge">
            Administrator
          </div>
        </header>

        {error && (
          <div className="admin-companies-error">
            {error}
          </div>
        )}

        <section className="admin-redemption-summary">

          <div className="admin-redemption-card">
            <span>Total Redemptions</span>
            <strong>
              {summary.totalRedemptions || 0}
            </strong>
            <small>All redemption requests</small>
          </div>

          <div className="admin-redemption-card">
            <span>Pending</span>
            <strong>
              {summary.pending || 0}
            </strong>
            <small>Waiting for processing</small>
          </div>

          <div className="admin-redemption-card">
            <span>Completed</span>
            <strong>
              {summary.completed || 0}
            </strong>
            <small>Successfully processed</small>
          </div>

          <div className="admin-redemption-card">
            <span>Points Redeemed</span>
            <strong>
              {summary.totalPointsSpent || 0}
            </strong>
            <small>Completed redemptions</small>
          </div>

        </section>

        <section className="admin-redemption-panel">

          <div className="admin-redemption-toolbar">

            <div>
              <h2>Redemption Requests</h2>

              <p>
                {filteredRedemptions.length} request
                {filteredRedemptions.length === 1 ? '' : 's'} shown
              </p>
            </div>

            <div className="admin-redemption-controls">

              <input
                type="text"
                placeholder="Search user or reward..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

            </div>
          </div>

          {loading ? (

            <div className="admin-redemption-message">
              Loading redemptions...
            </div>

          ) : filteredRedemptions.length === 0 ? (

            <div className="admin-redemption-empty">
              <div className="admin-redemption-empty-icon">
                🎁
              </div>

              <h3>No redemptions yet</h3>

              <p>
                Reward redemption requests will appear here
                when users redeem their points.
              </p>
            </div>

          ) : (

            <div className="admin-redemption-table-wrapper">

              <table className="admin-redemption-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Reward</th>
                    <th>Points Spent</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRedemptions.map((redemption) => (

                    <tr key={redemption._id}>

                      <td>
                        <div className="admin-redemption-user">
                          <strong>
                            {redemption.user?.name ||
                              'Unknown User'}
                          </strong>

                          <span>
                            {redemption.user?.email ||
                              'No email'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {redemption.rewardName}
                        </strong>
                      </td>

                      <td>
                        {redemption.pointsSpent}
                      </td>

                      <td>
                        <span
                          className={`redemption-status ${redemption.status}`}
                        >
                          {redemption.status}
                        </span>
                      </td>

                      <td>
                        {redemption.createdAt
                          ? new Date(
                              redemption.createdAt
                            ).toLocaleDateString()
                          : 'N/A'}
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

export default AdminRedemptions;
