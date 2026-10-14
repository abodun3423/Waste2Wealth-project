import { API_URL } from '../apiBase';
import React, { useEffect, useState } from 'react';
import RecyclableForm from '../components/RecyclableForm';
import dashboardHero from '../assets/dashboard-hero.jpg';

function Dashboard() {
  const [recyclables, setRecyclables] = useState([]);
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);
  const [pickups, setPickups] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('All');

  const token = localStorage.getItem('token');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [recyclablesResponse, rewardsResponse, pickupsResponse, redemptionsResponse] = await Promise.all([
          fetch(`${API_URL}/api/recyclables`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch(`${API_URL}/api/rewards`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/pickups`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/redemptions`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const recyclablesData = await recyclablesResponse.json();
        const rewardsData = await rewardsResponse.json();
        const pickupsData = await pickupsResponse.json();
        const redemptionsData = await redemptionsResponse.json();

        if (!recyclablesResponse.ok) {
          throw new Error(
            recyclablesData.error || 'Failed to load recyclables'
          );
        }

        if (!rewardsResponse.ok) {
          throw new Error(
            rewardsData.error || 'Failed to load rewards'
          );
        }

        if (!pickupsResponse.ok || !Array.isArray(pickupsData)) throw new Error(pickupsData.error || 'Failed to load pickup history');
        if (!redemptionsResponse.ok || !Array.isArray(redemptionsData)) throw new Error(redemptionsData.error || 'Failed to load reward history');
        setRecyclables(recyclablesData);
        setPickups(pickupsData);
        setRedemptions(redemptionsData);
        setPoints(Number(rewardsData.points) || 0);

      } catch (error) {
        console.error('Dashboard error:', error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleAddRecyclable = async (item) => {
    try {
      setMessage('');

      const response = await fetch(
        `${API_URL}/api/recyclables`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type: item.type,
            weight: item.weight
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setRecyclables((previousRecyclables) => [
        data.recyclable,
        ...previousRecyclables
      ]);

      // The API intentionally does not change reward balances for unverified uploads.
      setMessage('Success: Recyclable recorded successfully. Points will be awarded only after a verified company completes collection and confirms the actual weight.');

    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.message);
    }
  };

  // Only completed company-verified pickups count as actually recycled.
  const verifiedPickups = pickups.filter((item) =>
    item.status === 'completed' && item.pointsProcessed === true &&
    Number.isFinite(Number(item.verifiedWeight)) && Number(item.verifiedWeight) > 0
  );
  const totalWeight = verifiedPickups.reduce((total, item) => total + Number(item.verifiedWeight), 0);
  const verifiedPoints = verifiedPickups.reduce((total, item) => total + (Number(item.pointsAwarded) || 0), 0);
  const spentPoints = redemptions.reduce((total, item) => total + (Number(item.pointsSpent) || 0), 0);
  // A balance may include legitimate pre-migration activity not represented by pickup records.
  const unexplainedBalance = points - verifiedPoints + spentPoints;

  const events = [
    ...recyclables.map((item) => ({
      id: 'upload-' + item._id, date: item.createdAt, kind: 'Upload',
      label: item.type || 'Recyclable', weight: item.weight,
      detail: 'Self-reported — not yet company-verified', points: null
    })),
    ...pickups.map((item) => ({
      id: 'pickup-' + item._id, date: item.updatedAt || item.createdAt, kind: 'Pickup',
      label: item.material || 'Recycling pickup',
      weight: item.status === 'completed' ? item.verifiedWeight : item.estimatedWeight,
      detail: item.status === 'completed'
        ? 'Completed — weight verified by recycling company'
        : 'Status: ' + (item.status || 'pending') + ' — estimated weight',
      points: item.status === 'completed' && item.pointsProcessed ? Number(item.pointsAwarded || 0) : null
    })),
    ...redemptions.map((item) => ({
      id: 'redemption-' + item._id, date: item.createdAt, kind: 'Redemption',
      label: item.rewardName || 'Reward', weight: null, detail: 'Status: ' + (item.status || 'pending'),
      points: -(Number(item.pointsSpent) || 0)
    }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredEvents = historyFilter === 'All' ? events : events.filter(event => event.kind === historyFilter);
  const pendingPickups = pickups.filter(item => ['pending', 'accepted', 'collected'].includes(item.status)).length;
  const lifetimeEarned = verifiedPickups.reduce((sum, p) => sum + (Number(p.pointsAwarded) || 0), 0);

  return (
    <div className="page-container">

      <div
        className="dashboard-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(5, 70, 45, 0.92),
              rgba(5, 70, 45, 0.45)
            ),
            url(${dashboardHero})
          `
        }}
      >
        <div className="dashboard-hero-content">
          <span className="hero-tag">
            ♻️ Sustainable Living
          </span>

          <h1>
            Turn Waste Into Value
          </h1>

          <p>
            Track your recyclable materials, earn reward points
            and contribute to a cleaner environment.
          </p>

          <div className="hero-user">
            Welcome back, {user?.name || 'Recycler'}.
          </div>
        </div>
      </div>

      <div className="stats-grid dashboard-stats">
        <div className="card stat-card">
          <h4>Total Recycled</h4>
          <strong>{totalWeight.toFixed(1)} kg</strong>
          <span>♻️ Company-verified recycling (see pickup history)</span>
        </div>

        <div className="card stat-card">
          <h4>Reward Points</h4>
          <strong>{points}</strong>
          <span>⭐ Available balance · see activity below</span>
        </div>

        <div className="card stat-card">
          <h4>Total Uploads</h4>
          <strong>{recyclables.length}</strong>
          <span>📦 Upload submissions (not verified collections)</span>
        </div>
      </div>

      <div className="stats-grid dashboard-stats" aria-label="Additional recycling statistics">
        <div className="card stat-card"><h4>Pending Pickups</h4><strong>{pendingPickups}</strong><span>🚚 Awaiting collection or verification</span></div>
        <div className="card stat-card"><h4>Points from Verified Pickups</h4><strong>{lifetimeEarned.toLocaleString()}</strong><span>⭐ Tracked awards (not current balance)</span></div>
        <div className="card stat-card"><h4>Redemptions</h4><strong>{redemptions.length}</strong><span>🎁 Recorded reward requests</span></div>
      </div>

      <div className="card form-card">
        <div className="section-heading">
          <div>
            <h3>Add Recyclable</h3>
            <p>
              Record a recyclable submission. Points are awarded after an approved company verifies the collected weight.
            </p>
          </div>
        </div>

        <RecyclableForm onAdd={handleAddRecyclable} />

        {message && (
          <p
            className={
              message.toLowerCase().includes('success')
                ? 'success-message'
                : 'error-message'
            }
          >
            {message}
          </p>
        )}
      </div>

      <div className="card table-card">
        <div className="section-heading">
          <div>
            <h3>Recent Recycling Activity</h3>
            <p>
              Your latest recyclable submissions.
            </p>
          </div>
        </div>

        {recyclables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♻️</div>
            <h4>No recyclables yet</h4>
            <p>
              Your uploads will appear here. Only verified, completed pickups earn points.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Weight</th>
                <th>Verification</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {recyclables.map((recyclable) => (
                <tr key={recyclable._id}>
                  <td>
                    <span className="material-name">
                      ♻️ {recyclable.type}
                    </span>
                  </td>

                  <td>
                    {recyclable.weight} kg
                  </td>

                  <td>
                    Not yet verified
                  </td>

                  <td>
                    {recyclable.createdAt
                      ? new Date(
                          recyclable.createdAt
                        ).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card table-card">
        <div className="section-heading">
          <div>
            <h3>Recycling &amp; Rewards History</h3>
            <p>All recorded uploads, pickup progress and reward redemptions for this account.</p>
            <label htmlFor="history-filter" style={{display:'block', marginTop:'0.8rem'}}>Filter history</label>
            <select id="history-filter" className="input" value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
              <option>All</option><option>Pickup</option><option>Upload</option><option>Redemption</option>
            </select>
          </div>
        </div>
        {loading ? <p>Loading your history...</p> : (
          <>
            <p><strong>{pickups.length}</strong> pickup requests · <strong>{verifiedPickups.length}</strong> completed and verified · <strong>{recyclables.length}</strong> upload records · <strong>{redemptions.length}</strong> redemptions.</p>
            {unexplainedBalance !== 0 && (
              <p role="note">Your current balance includes {unexplainedBalance > 0 ? 'points not traceable to the available verified pickup and redemption records' : 'historical adjustments or redemptions not fully explained by the available pickup records'}.
                Existing balances have been preserved; no historical entries were invented.</p>
            )}
            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <p>No matching activity is available. Choose another filter or create a new recycling submission.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Activity</th><th>Material / Reward</th><th>Weight</th><th>Status / Verification</th><th>Points</th></tr></thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>{event.date && !Number.isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString('en-NG') : 'Date unavailable'}</td>
                        <td>{event.kind}</td><td>{event.label}</td>
                        <td>{event.weight == null ? '—' : Number(event.weight) + ' kg'}</td>
                        <td>{event.detail}</td>
                        <td>{event.points == null ? 'Not awarded' : (event.points > 0 ? '+' : '') + event.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
