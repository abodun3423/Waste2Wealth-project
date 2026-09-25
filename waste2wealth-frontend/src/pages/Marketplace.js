import React, { useEffect, useState } from 'react';

import marketplaceHero from '../assets/marketplace-hero.jpg';
import airtimeImage from '../assets/airtime.png';
import reusableBagImage from '../assets/reusable-bag.webp';
import solarLampImage from '../assets/solar-lamp.jpg';

function Marketplace() {
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  const token = localStorage.getItem('token');

  const rewards = [
    {
      id: 'airtime500',
      name: '₦500 Airtime',
      points: 500,
      description: 'Redeem your points for ₦500 mobile airtime.',
      image: airtimeImage
    },
    {
      id: 'data1gb',
      name: '1GB Data',
      points: 1000,
      description: 'Use your points to redeem a 1GB data bundle.',
      image: airtimeImage
    },
    {
      id: 'reusableBag',
      name: 'Reusable Shopping Bag',
      points: 1500,
      description: 'Eco-friendly reusable shopping bag.',
      image: reusableBagImage
    },
    {
      id: 'recyclingBin',
      name: 'Recycling Bin',
      points: 2500,
      description: 'A household recycling bin for proper waste sorting.',
      image: reusableBagImage
    },
    {
      id: 'solarLamp',
      name: 'Solar Rechargeable Lamp',
      points: 7500,
      description: 'Portable rechargeable solar lamp.',
      image: solarLampImage
    }
  ];

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/rewards',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load points');
        }

        setPoints(data.points || 0);

      } catch (error) {
        console.error('Marketplace points error:', error);
        setMessage(error.message);

      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [token]);

  const handleRedeem = async (reward) => {
    try {
      setMessage('');
      setRedeeming(reward.id);

      const response = await fetch(
        'http://localhost:5000/api/redemptions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rewardId: reward.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Redemption failed');
      }

      setPoints(data.remainingPoints);

      setMessage(
        `${reward.name} redeemed successfully! ${reward.points} points deducted.`
      );

    } catch (error) {
      console.error('Redemption error:', error);
      setMessage(error.message);

    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="page-container marketplace-page">

      <div
        className="marketplace-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(4, 82, 54, 0.95),
              rgba(4, 82, 54, 0.45)
            ),
            url(${marketplaceHero})
          `
        }}
      >
        <div className="marketplace-hero-content">
          <span className="hero-tag">
            🎁 Reward Marketplace
          </span>

          <h1>Turn Your Points Into Rewards</h1>

          <p>
            Redeem the points you earn from recycling for useful
            rewards and eco-friendly products.
          </p>

          <div className="marketplace-benefits">
            <span>🌱 Recycle More</span>
            <span>🎁 Get Rewards</span>
            <span>🌍 Build a Greener Future</span>
          </div>
        </div>
      </div>

      <div className="marketplace-balance-card">
        <div className="balance-left">
          <div className="balance-icon">⭐</div>

          <div>
            <span>Your Available Balance</span>
            <strong>
              {loading ? '...' : points} Points
            </strong>
          </div>
        </div>

        <p>
          Redeem rewards. Support sustainability.
          Create a cleaner tomorrow.
        </p>
      </div>

      {message && (
        <div className="marketplace-message">
          {message}
        </div>
      )}

      <div className="marketplace-section-heading">
        <div>
          <h2>Available Rewards</h2>
          <p>
            Choose a reward that matches your current points balance.
          </p>
        </div>
      </div>

      <div className="market-grid">
        {rewards.map((reward) => {
          const canRedeem = points >= reward.points;
          const isRedeeming = redeeming === reward.id;

          return (
            <div
              key={reward.id}
              className="card market-card"
            >
              <div className="reward-image-wrapper">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="reward-image"
                />
              </div>

              <div className="reward-card-content">
                <h3>{reward.name}</h3>

                <p>{reward.description}</p>

                <div className="points-badge">
                  ⭐ {reward.points} Points
                </div>

                <button
                  className="primary-button reward-button"
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || isRedeeming}
                >
                  {isRedeeming
                    ? 'Redeeming...'
                    : canRedeem
                    ? 'Redeem Reward'
                    : 'Not Enough Points'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="marketplace-footer-card">
        <div className="footer-icon">🌱</div>

        <div>
          <h3>Together for a Cleaner Environment</h3>
          <p>
            Every reward you redeem supports a more sustainable
            and eco-friendly future.
          </p>
        </div>

        <div className="footer-motto">
          Reduce | Reuse | Recycle
        </div>
      </div>

    </div>
  );
}

export default Marketplace;
