import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://waste2wealth-project-3.onrender.com';

function CompanyDashboard() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [verifiedWeights, setVerifiedWeights] = useState({});

  const companyToken = localStorage.getItem('companyToken');

  useEffect(() => {
    if (!companyToken) {
      navigate('/company/login');
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = {
          Authorization: `Bearer ${companyToken}`
        };

        const [profileResponse, pickupsResponse] = await Promise.all([
          fetch(`${API_URL}/api/company/me`, { headers }),
          fetch(`${API_URL}/api/company/pickups`, { headers })
        ]);

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403 ||
          pickupsResponse.status === 401 ||
          pickupsResponse.status === 403
        ) {
          localStorage.removeItem('companyToken');
          localStorage.removeItem('company');
          navigate('/company/login');
          return;
        }

        const profileData = await profileResponse.json();
        const pickupsData = await pickupsResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.error || 'Unable to load company profile'
          );
        }

        if (!pickupsResponse.ok) {
          throw new Error(
            pickupsData.error || 'Unable to load pickup requests'
          );
        }

        setCompany(profileData.company);
        setPickups(pickupsData.pickups || []);
      } catch (err) {
        setError(err.message || 'Unable to load company dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [companyToken, navigate]);

  const updatePickupStatus = async (pickupId, status) => {
    try {
      setUpdatingId(pickupId);
      setError('');
      setMessage('');

      const body = { status };

      if (status === 'completed') {
        const weight = Number(verifiedWeights[pickupId]);

        if (!weight || weight <= 0) {
          setError(
            'Enter a valid verified weight before completing the pickup.'
          );
          setUpdatingId(null);
          return;
        }

        body.verifiedWeight = weight;
      }

      const response = await fetch(
        `${API_URL}/api/company/pickups/${pickupId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${companyToken}`
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('companyToken');
        localStorage.removeItem('company');
        navigate('/company/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update pickup');
      }

      setPickups((current) =>
        current.map((pickup) =>
          pickup._id === pickupId ? data.pickup : pickup
        )
      );

      setMessage(data.message || 'Pickup updated successfully');

      if (status === 'completed') {
        setVerifiedWeights((current) => ({
          ...current,
          [pickupId]: ''
        }));
      }
    } catch (err) {
      setError(err.message || 'Unable to update pickup');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('companyToken');
    localStorage.removeItem('company');
    navigate('/company/login');
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString();
  };

  const pendingCount = pickups.filter(
    (pickup) => pickup.status === 'pending'
  ).length;

  const activeCount = pickups.filter(
    (pickup) =>
      pickup.status === 'accepted' ||
      pickup.status === 'collected'
  ).length;

  const completedCount = pickups.filter(
    (pickup) => pickup.status === 'completed'
  ).length;

  if (loading) {
    return (
      <div className="company-dashboard-loading">
        <div className="company-loading-spinner"></div>
        <p>Loading your company dashboard...</p>
      </div>
    );
  }

  return (
    <div className="company-portal">
      <aside className="company-sidebar">
        <div className="company-brand">
          <div className="company-brand-icon">♻</div>

          <div>
            <h2>Waste2Wealth</h2>
            <span>Company Portal</span>
          </div>
        </div>

        <nav className="company-nav">
          <button className="company-nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="company-nav-item"
            onClick={() =>
              document
                .getElementById('company-pickups')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span>♻</span>
            Pickups
          </button>

          <button
            className="company-nav-item"
            onClick={() =>
              document
                .getElementById('company-profile')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span>●</span>
            Company Profile
          </button>
        </nav>

        <div className="company-sidebar-bottom">
          <button
            className="company-sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="company-main">
        <header className="company-topbar">
          <div>
            <span className="company-topbar-label">
              RECYCLING PARTNER PORTAL
            </span>

            <h1>
              Welcome back
              {company?.companyName
                ? `, ${company.companyName}`
                : ''}
            </h1>

            <p>
              Manage pickup requests and recycling operations
              from one place.
            </p>
          </div>

          <div className="company-topbar-account">
            <div className="company-avatar">
              {company?.companyName?.charAt(0)?.toUpperCase() || 'C'}
            </div>

            <div>
              <strong>{company?.companyName}</strong>
              <span>{company?.email}</span>
            </div>
          </div>
        </header>

        <section className="company-content">
          {error && (
            <div className="company-dashboard-error">
              {error}
            </div>
          )}

          {message && (
            <div className="company-dashboard-success">
              {message}
            </div>
          )}

          <div className="company-stat-grid">
            <div className="company-stat-card">
              <div className="company-stat-icon">♻</div>
              <div>
                <span>Total Pickups</span>
                <strong>{pickups.length}</strong>
                <small>All assigned requests</small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon pending">⌛</div>
              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
                <small>Awaiting action</small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon active">↻</div>
              <div>
                <span>In Progress</span>
                <strong>{activeCount}</strong>
                <small>Accepted or collected</small>
              </div>
            </div>

            <div className="company-stat-card">
              <div className="company-stat-icon complete">✓</div>
              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
                <small>Successfully recycled</small>
              </div>
            </div>
          </div>

          {company && (
            <section
              className="company-overview-card"
              id="company-profile"
            >
              <div className="company-overview-heading">
                <div>
                  <span className="company-section-label">
                    COMPANY ACCOUNT
                  </span>
                  <h2>Company Overview</h2>
                </div>

                <span
                  className={
                    company.verified
                      ? 'company-verification verified'
                      : 'company-verification pending'
                  }
                >
                  <span className="verification-dot"></span>
                  {company.verified
                    ? 'Verified Company'
                    : 'Pending Verification'}
                </span>
              </div>

              <div className="company-info-grid">
                <div className="company-info-item">
                  <span>Company Name</span>
                  <strong>{company.companyName}</strong>
                </div>

                <div className="company-info-item">
                  <span>Email Address</span>
                  <strong>{company.email}</strong>
                </div>

                <div className="company-info-item">
                  <span>Location</span>
                  <strong>
                    {company.city}, {company.state}
                  </strong>
                </div>

                <div className="company-info-item">
                  <span>Pickup Service</span>
                  <strong>
                    {company.pickupAvailable
                      ? 'Available'
                      : 'Not Available'}
                  </strong>
                </div>
              </div>

              {!company.verified && (
                <div className="company-verification-note">
                  <div className="verification-note-icon">i</div>
                  <div>
                    <strong>
                      Your company is awaiting verification
                    </strong>
                    <p>
                      Waste2Wealth administrators will review your
                      company information. Your verification status
                      will update here.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          <section
            className="company-pickups-section"
            id="company-pickups"
          >
            <div className="company-section-heading">
              <div>
                <span className="company-section-label">
                  OPERATIONS
                </span>
                <h2>Assigned Pickups</h2>
                <p>
                  Review and manage recycling requests assigned
                  to your company.
                </p>
              </div>

              <div className="company-pickup-count">
                {pickups.length}{' '}
                {pickups.length === 1 ? 'Request' : 'Requests'}
              </div>
            </div>

            {pickups.length === 0 ? (
              <div className="company-empty-state">
                <div className="company-empty-icon">♻</div>

                <h3>No pickup requests yet</h3>

                <p>
                  When Waste2Wealth users select your company
                  for recycling pickup, their requests will
                  appear here.
                </p>

                <span>
                  You're all caught up for now.
                </span>
              </div>
            ) : (
              <div className="company-pickup-grid">
                {pickups.map((pickup) => (
                  <article
                    className="company-pickup-card"
                    key={pickup._id}
                  >
                    <div className="company-pickup-card-top">
                      <div>
                        <span className="pickup-material-label">
                          MATERIAL
                        </span>

                        <h3>{pickup.material}</h3>

                        <p>
                          Requested by{' '}
                          <strong>
                            {pickup.user?.name ||
                              'Waste2Wealth User'}
                          </strong>
                        </p>
                      </div>

                      <span
                        className={`company-status company-status-${pickup.status}`}
                      >
                        {pickup.status}
                      </span>
                    </div>

                    <div className="company-pickup-details">
                      <div>
                        <span>Estimated Weight</span>
                        <strong>
                          {pickup.estimatedWeight} kg
                        </strong>
                      </div>

                      <div>
                        <span>Preferred Date</span>
                        <strong>
                          {formatDate(pickup.preferredDate)}
                        </strong>
                      </div>

                      <div>
                        <span>Location</span>
                        <strong>
                          {pickup.city}, {pickup.state}
                        </strong>
                      </div>

                      <div>
                        <span>Phone</span>
                        <strong>{pickup.phone}</strong>
                      </div>
                    </div>

                    <div className="company-address-box">
                      <span>Pickup Address</span>
                      <p>{pickup.pickupAddress}</p>
                    </div>

                    {pickup.notes && (
                      <div className="company-address-box">
                        <span>Customer Notes</span>
                        <p>{pickup.notes}</p>
                      </div>
                    )}

                    {pickup.status === 'completed' && (
                      <div className="company-completed-summary">
                        <div>
                          <span>Verified Weight</span>
                          <strong>
                            {pickup.verifiedWeight} kg
                          </strong>
                        </div>

                        <div>
                          <span>Points Awarded</span>
                          <strong>
                            {pickup.pointsAwarded}
                          </strong>
                        </div>
                      </div>
                    )}

                    <div className="company-pickup-actions">
                      {pickup.status === 'pending' && (
                        <>
                          <button
                            disabled={
                              updatingId === pickup._id
                            }
                            onClick={() =>
                              updatePickupStatus(
                                pickup._id,
                                'accepted'
                              )
                            }
                          >
                            Accept Pickup
                          </button>

                          <button
                            className="company-cancel-btn"
                            disabled={
                              updatingId === pickup._id
                            }
                            onClick={() =>
                              updatePickupStatus(
                                pickup._id,
                                'cancelled'
                              )
                            }
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {pickup.status === 'accepted' && (
                        <>
                          <button
                            disabled={
                              updatingId === pickup._id
                            }
                            onClick={() =>
                              updatePickupStatus(
                                pickup._id,
                                'collected'
                              )
                            }
                          >
                            Mark as Collected
                          </button>

                          <button
                            className="company-cancel-btn"
                            disabled={
                              updatingId === pickup._id
                            }
                            onClick={() =>
                              updatePickupStatus(
                                pickup._id,
                                'cancelled'
                              )
                            }
                          >
                            Cancel Pickup
                          </button>
                        </>
                      )}

                      {pickup.status === 'collected' && (
                        <div className="company-complete-section">
                          <label>
                            Verified Weight (kg)
                          </label>

                          <p>
                            Enter the actual measured weight.
                            The customer will receive 10 points
                            per kilogram.
                          </p>

                          <div className="company-weight-action">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="e.g. 8.5"
                              value={
                                verifiedWeights[pickup._id] ||
                                ''
                              }
                              onChange={(e) =>
                                setVerifiedWeights(
                                  (current) => ({
                                    ...current,
                                    [pickup._id]:
                                      e.target.value
                                  })
                                )
                              }
                            />

                            <button
                              disabled={
                                updatingId === pickup._id
                              }
                              onClick={() =>
                                updatePickupStatus(
                                  pickup._id,
                                  'completed'
                                )
                              }
                            >
                              Complete & Award Points
                            </button>
                          </div>
                        </div>
                      )}

                      {pickup.status === 'completed' && (
                        <div className="company-final-status completed">
                          ✓ Pickup completed successfully
                        </div>
                      )}

                      {pickup.status === 'cancelled' && (
                        <div className="company-final-status cancelled">
                          This pickup was cancelled
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default CompanyDashboard;