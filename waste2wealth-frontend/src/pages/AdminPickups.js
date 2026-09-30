import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminPickups() {
  const [pickups, setPickups] = useState([]);
  const [summary, setSummary] = useState({
    totalPickups: 0,
    pending: 0,
    accepted: 0,
    collected: 0,
    completed: 0,
    cancelled: 0,
    totalVerifiedWeightKg: 0,
    totalPointsAwarded: 0
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPickups = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/admin/pickups',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load pickup requests'
        );
      }

      setPickups(data.pickups || []);

      setSummary(
        data.summary || {
          totalPickups: 0,
          pending: 0,
          accepted: 0,
          collected: 0,
          completed: 0,
          cancelled: 0,
          totalVerifiedWeightKg: 0,
          totalPointsAwarded: 0
        }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const filteredPickups = useMemo(() => {
    return pickups.filter((pickup) => {
      const text = search.toLowerCase();

      const matchesSearch =
        pickup.user?.name?.toLowerCase().includes(text) ||
        pickup.user?.email?.toLowerCase().includes(text) ||
        pickup.company?.companyName
          ?.toLowerCase()
          .includes(text) ||
        pickup.material?.toLowerCase().includes(text) ||
        pickup.city?.toLowerCase().includes(text) ||
        pickup.state?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === 'all' ||
        pickup.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pickups, search, statusFilter]);

  return (
    <div className="admin-shell">

      <AdminSidebar activePage="pickups" />

      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">
              PICKUP MANAGEMENT
            </p>

            <h1>Pickup Requests</h1>

            <p>
              Monitor recycling pickups and track their
              progress across the platform.
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

        <section className="admin-pickup-summary">

          <div className="admin-pickup-summary-card">
            <span>Total Pickups</span>
            <strong>{summary.totalPickups}</strong>
            <small>All pickup requests</small>
          </div>

          <div className="admin-pickup-summary-card">
            <span>Pending</span>
            <strong>{summary.pending}</strong>
            <small>Waiting for acceptance</small>
          </div>

          <div className="admin-pickup-summary-card">
            <span>In Progress</span>
            <strong>
              {summary.accepted + summary.collected}
            </strong>
            <small>Accepted or collected</small>
          </div>

          <div className="admin-pickup-summary-card">
            <span>Completed</span>
            <strong>{summary.completed}</strong>
            <small>Successfully completed</small>
          </div>

        </section>

        <section className="admin-pickup-impact">

          <div>
            <span>Verified Recycling Weight</span>

            <strong>
              {Number(
                summary.totalVerifiedWeightKg || 0
              ).toFixed(1)} kg
            </strong>
          </div>

          <div>
            <span>Points Awarded</span>

            <strong>
              {summary.totalPointsAwarded || 0}
            </strong>
          </div>

          <div>
            <span>Cancelled Pickups</span>

            <strong>
              {summary.cancelled || 0}
            </strong>
          </div>

        </section>

        <section className="admin-pickup-panel">

          <div className="admin-pickup-toolbar">

            <div>
              <h2>All Pickup Requests</h2>

              <p>
                {filteredPickups.length} request
                {filteredPickups.length === 1 ? '' : 's'} shown
              </p>
            </div>

            <div className="admin-pickup-controls">

              <input
                type="text"
                placeholder="Search user, company or material..."
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

                <option value="accepted">
                  Accepted
                </option>

                <option value="collected">
                  Collected
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

            <div className="admin-pickup-message">
              Loading pickup requests...
            </div>

          ) : filteredPickups.length === 0 ? (

            <div className="admin-pickup-message">
              No pickup requests found.
            </div>

          ) : (

            <div className="admin-pickup-table-wrapper">

              <table className="admin-pickup-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Company</th>
                    <th>Material</th>
                    <th>Weight</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Points</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredPickups.map((pickup) => (

                    <tr key={pickup._id}>

                      <td>
                        <div className="admin-pickup-user">
                          <strong>
                            {pickup.user?.name || 'Unknown User'}
                          </strong>

                          <span>
                            {pickup.user?.email || 'No email'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-pickup-company">
                          <strong>
                            {pickup.company?.companyName ||
                              'Unknown Company'}
                          </strong>

                          <span>
                            {pickup.company?.city || ''}
                            {pickup.company?.state
                              ? `, ${pickup.company.state}`
                              : ''}
                          </span>
                        </div>
                      </td>

                      <td>
                        {pickup.material || 'N/A'}
                      </td>

                      <td>
                        <div className="admin-pickup-weight">
                          <span>
                            Est: {pickup.estimatedWeight || 0} kg
                          </span>

                          {pickup.verifiedWeight != null && (
                            <strong>
                              Verified: {pickup.verifiedWeight} kg
                            </strong>
                          )}
                        </div>
                      </td>

                      <td>
                        {pickup.city || 'N/A'}
                        {pickup.state
                          ? `, ${pickup.state}`
                          : ''}
                      </td>

                      <td>
                        <span
                          className={`pickup-admin-status ${pickup.status}`}
                        >
                          {pickup.status}
                        </span>
                      </td>

                      <td>
                        {pickup.pointsAwarded || 0}
                      </td>

                      <td>
                        {pickup.createdAt
                          ? new Date(
                              pickup.createdAt
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

export default AdminPickups;
