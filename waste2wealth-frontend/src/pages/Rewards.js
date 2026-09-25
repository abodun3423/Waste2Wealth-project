import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import rewardsHero from '../assets/marketplace-hero.jpg';

function Rewards() {
  const [rewards, setRewards] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [recyclables, setRecyclables] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadRewardsData = async () => {
      try {
        setLoading(true);
        setMessage('');

        const [
          rewardsResponse,
          redemptionResponse,
          recyclablesResponse
        ] = await Promise.all([
          fetch('http://localhost:5000/api/rewards', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch('http://localhost:5000/api/redemptions', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),

          fetch('http://localhost:5000/api/recyclables', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const rewardsData = await rewardsResponse.json();
        const redemptionData = await redemptionResponse.json();
        const recyclablesData = await recyclablesResponse.json();

        if (!rewardsResponse.ok) {
          throw new Error(
            rewardsData.error || 'Failed to load rewards'
          );
        }

        if (!redemptionResponse.ok) {
          throw new Error(
            redemptionData.error || 'Failed to load redemption history'
          );
        }

        if (!recyclablesResponse.ok) {
          throw new Error(
            recyclablesData.error || 'Failed to load recycling data'
          );
        }

        setRewards(rewardsData);
        setRedemptions(redemptionData);
        setRecyclables(recyclablesData);

      } catch (error) {
        console.error('Rewards page error:', error);
        setMessage(error.message);

      } finally {
        setLoading(false);
      }
    };

    loadRewardsData();
  }, [token]);

  const totalRecycled = recyclables.reduce(
    (total, item) => total + Number(item.weight || 0),
    0
  );

  const totalRedeemed = redemptions.length;

  const currentPoints = rewards?.points || 0;

  // Prototype milestone
  const nextRewardPoints = 500;

  const progress = Math.min(
    100,
    Math.round((currentPoints / nextRewardPoints) * 100)
  );

  const pointsRemaining = Math.max(
    0,
    nextRewardPoints - currentPoints
  );

  return (
    <div className="page-container rewards-page">

      <div
        className="rewards-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(4, 82, 54, 0.94),
              rgba(4, 82, 54, 0.40)
            ),
            url(${rewardsHero})
          `
        }}
      >
        <div className="rewards-hero-content">
          <span className="hero-tag">
            ⭐ My Rewards
          </span>

          <h1>Your Impact Deserves Rewards</h1>

          <p>
            Turn your recycling efforts into real value.
            Redeem your points for useful items and services.
          </p>

          <div className="rewards-benefits">
            <span>🌱 Recycle More</span>
            <span>🎁 Earn Rewards</span>
            <span>🌍 Support a Cleaner Environment</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="marketplace-message">
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading rewards...</p>
      ) : (
        <>
          <div className="rewards-stats-grid">

            <div className="card reward-stat-card">
              <div className="reward-stat-icon">⭐</div>
              <div>
                <span>Your Balance</span>
                <strong>{currentPoints}</strong>
                <small>Points</small>
              </div>
            </div>

            <div className="card reward-stat-card">
              <div className="reward-stat-icon">🎁</div>
              <div>
                <span>Total Redeemed</span>
                <strong>{totalRedeemed}</strong>
                <small>Rewards</small>
              </div>
            </div>

            <div className="card reward-stat-card">
              <div className="reward-stat-icon">🌿</div>
              <div>
                <span>Total Recycled</span>
                <strong>{totalRecycled.toFixed(1)} kg</strong>
                <small>Materials</small>
              </div>
            </div>

            <div className="card reward-stat-card">
              <div className="reward-stat-icon">🏆</div>
              <div>
                <span>Member</span>
                <strong>{recyclables.length}</strong>
                <small>Recycling uploads</small>
              </div>
            </div>

          </div>

          <div className="rewards-progress-card">

            <div className="progress-content">
              <div className="progress-icon">🎁</div>

              <div className="progress-main">
                <h3>
                  {pointsRemaining > 0
                    ? `You're ${pointsRemaining} points away!`
                    : 'Reward unlocked!'}
                </h3>

                <p>
                  Next reward: <strong>₦500 Airtime</strong>
                </p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`
                    }}
                  />
                </div>

                <div className="progress-labels">
                  <span>
                    {currentPoints} / {nextRewardPoints} points
                  </span>

                  <strong>{progress}%</strong>
                </div>
              </div>
            </div>

            <div className="progress-quote">
              <p>
                “Every bottle, every bag, every effort
                brings a greener tomorrow.”
              </p>

              <strong>
                🌱 Reduce | Reuse | Recycle
              </strong>
            </div>

          </div>

          <div className="card redemption-history-card">

            <div className="redemption-heading">
              <div>
                <h2>Recent Redemptions</h2>
                <p>
                  Your latest reward redemption activity.
                </p>
              </div>
            </div>

            {redemptions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <h4>No rewards redeemed yet</h4>
                <p>
                  Visit the Marketplace when you have enough
                  points to redeem your first reward.
                </p>
              </div>
            ) : (
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reward</th>
                      <th>Points Used</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {redemptions.map((redemption, index) => (
                      <tr key={redemption._id}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {redemption.rewardName}
                          </strong>
                        </td>

                        <td>
                          {redemption.pointsSpent}
                        </td>

                        <td>
                          {new Date(
                            redemption.createdAt
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${redemption.status}`}
                          >
                            {redemption.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          <div className="rewards-footer-card">

            <div className="footer-icon">🌍</div>

            <div>
              <h3>Together for a Cleaner World</h3>

              <p>
                Your rewards not only benefit you, but also
                support a more sustainable environment.
              </p>
            </div>

            <Link
              to="/marketplace"
              className="primary-button rewards-market-button"
            >
              🎁 Explore Marketplace
            </Link>

          </div>
        </>
      )}

    </div>
  );
}

export default Rewards;
