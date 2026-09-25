import React, { useEffect, useState } from 'react';
import RecyclableForm from '../components/RecyclableForm';
import dashboardHero from '../assets/dashboard-hero.jpg';

function Dashboard() {
  const [recyclables, setRecyclables] = useState([]);
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);

  const token = localStorage.getItem('token');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [recyclablesResponse, rewardsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/recyclables', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch('http://localhost:5000/api/rewards', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const recyclablesData = await recyclablesResponse.json();
        const rewardsData = await rewardsResponse.json();

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

        setRecyclables(recyclablesData);
        setPoints(rewardsData.points || 0);

      } catch (error) {
        console.error('Dashboard error:', error);
        setMessage(error.message);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleAddRecyclable = async (item) => {
    try {
      setMessage('');

      const response = await fetch(
        'http://localhost:5000/api/recyclables',
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

      setPoints(data.totalPoints);

      setMessage(
        `Recyclable uploaded successfully. You earned ${data.pointsEarned} points!`
      );

    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.message);
    }
  };

  const totalWeight = recyclables.reduce(
    (total, item) => total + Number(item.weight || 0),
    0
  );

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
          <span>♻️ Materials collected</span>
        </div>

        <div className="card stat-card">
          <h4>Reward Points</h4>
          <strong>{points}</strong>
          <span>⭐ Available balance</span>
        </div>

        <div className="card stat-card">
          <h4>Total Uploads</h4>
          <strong>{recyclables.length}</strong>
          <span>📦 Recycling records</span>
        </div>
      </div>

      <div className="card form-card">
        <div className="section-heading">
          <div>
            <h3>Add Recyclable</h3>
            <p>
              Record a recyclable material and earn points.
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
              Upload your first recyclable material to begin earning points.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Weight</th>
                <th>Estimated Points</th>
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
                    {Number(recyclable.weight) * 10} pts
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

    </div>
  );
}

export default Dashboard;
