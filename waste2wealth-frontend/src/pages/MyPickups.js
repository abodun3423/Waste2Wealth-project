import React, { useEffect, useState } from 'react';

function MyPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');


  // ==========================================
  // LOAD PICKUPS
  // ==========================================

  useEffect(() => {

    const loadPickups = async () => {
      try {
        setLoading(true);
        setMessage('');

        const response = await fetch(
          'http://localhost:5000/api/pickups',
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

        setPickups(data);

      } catch (error) {
        console.error('Load pickups error:', error);
        setMessage(error.message);

      } finally {
        setLoading(false);
      }
    };

    loadPickups();

  }, [token]);


  // ==========================================
  // STATUS INFORMATION
  // ==========================================

  const getStatusInfo = (status) => {

    switch (status) {

      case 'accepted':
        return {
          icon: '🔵',
          label: 'Accepted',
          description:
            'Your recycling company has accepted this pickup request.'
        };

      case 'collected':
        return {
          icon: '🟠',
          label: 'Collected',
          description:
            'Your recyclable materials have been collected and are awaiting final verification.'
        };

      case 'completed':
        return {
          icon: '🟢',
          label: 'Completed',
          description:
            'Pickup completed successfully and your recyclable materials have been verified.'
        };

      case 'cancelled':
        return {
          icon: '🔴',
          label: 'Cancelled',
          description:
            'This recycling pickup request was cancelled.'
        };

      default:
        return {
          icon: '🟡',
          label: 'Pending',
          description:
            'Your request has been submitted and is waiting for the recycling company to accept it.'
        };
    }
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) {
      return 'Not available';
    }

    return new Date(date).toLocaleDateString(
      'en-NG',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };


  // ==========================================
  // SUMMARY
  // ==========================================

  const totalPickups = pickups.length;

  const pendingPickups = pickups.filter(
    (pickup) => pickup.status === 'pending'
  ).length;

  const activePickups = pickups.filter(
    (pickup) =>
      pickup.status === 'accepted' ||
      pickup.status === 'collected'
  ).length;

  const completedPickups = pickups.filter(
    (pickup) => pickup.status === 'completed'
  ).length;

  const totalPoints = pickups.reduce(
    (total, pickup) =>
      total + (pickup.pointsAwarded || 0),
    0
  );


  // ==========================================
  // PROGRESS
  // ==========================================

  const getStepNumber = (status) => {

    switch (status) {

      case 'accepted':
        return 2;

      case 'collected':
        return 3;

      case 'completed':
        return 4;

      default:
        return 1;
    }
  };


  return (
    <div className="page-container my-pickups-page">

      {/* HERO */}

      <section className="pickups-hero">

        <div className="pickups-hero-content">

          <span className="pickups-hero-label">
            🚚 MY RECYCLING JOURNEY
          </span>

          <h1>
            Track Your Recycling Pickups
          </h1>

          <p>
            Follow every recycling request from submission
            to collection, verification and completion.
          </p>

        </div>


        <div className="pickups-hero-icon">
          🚚
        </div>

      </section>


      {/* SUMMARY */}

      <section className="pickup-summary-cards">

        <div className="pickup-summary-card">

          <div className="pickup-summary-icon">
            📦
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{totalPickups}</strong>
          </div>

        </div>


        <div className="pickup-summary-card">

          <div className="pickup-summary-icon pending">
            ⏳
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingPickups}</strong>
          </div>

        </div>


        <div className="pickup-summary-card">

          <div className="pickup-summary-icon active">
            🚚
          </div>

          <div>
            <span>In Progress</span>
            <strong>{activePickups}</strong>
          </div>

        </div>


        <div className="pickup-summary-card">

          <div className="pickup-summary-icon completed">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedPickups}</strong>
          </div>

        </div>


        <div className="pickup-summary-card">

          <div className="pickup-summary-icon points">
            ⭐
          </div>

          <div>
            <span>Points Earned</span>
            <strong>{totalPoints}</strong>
          </div>

        </div>

      </section>


      {/* MESSAGE */}

      {message && (

        <div className="pickup-page-message">
          {message}
        </div>

      )}


      {/* SECTION TITLE */}

      {!loading && pickups.length > 0 && (

        <div className="pickup-history-heading">

          <div>

            <span>
              PICKUP HISTORY
            </span>

            <h2>
              Your Recycling Pickups
            </h2>

            <p>
              View and track all your recycling requests.
            </p>

          </div>

        </div>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="pickup-page-empty">

          <div className="pickup-page-empty-icon">
            ♻️
          </div>

          <h2>
            Loading your pickups...
          </h2>

          <p>
            We're retrieving your recycling history.
          </p>

        </div>

      ) : pickups.length === 0 ? (

        /* EMPTY */

        <div className="pickup-page-empty">

          <div className="pickup-page-empty-icon">
            🚚
          </div>

          <h2>
            No pickup requests yet
          </h2>

          <p>
            Find a recycling company and request your
            first pickup. Your request will appear here.
          </p>

        </div>

      ) : (

        /* PICKUP LIST */

        <div className="pickup-history-list">

          {pickups.map((pickup) => {

            const statusInfo =
              getStatusInfo(pickup.status);

            const currentStep =
              getStepNumber(pickup.status);

            return (

              <article
                className="pickup-history-card"
                key={pickup._id}
              >

                {/* CARD HEADER */}

                <div className="pickup-history-card-header">

                  <div className="pickup-company-area">

                    <div className="pickup-company-icon">
                      ♻️
                    </div>

                    <div>

                      <span className="pickup-card-small-label">
                        RECYCLING COMPANY
                      </span>

                      <h2>
                        {pickup.company?.companyName ||
                          'Recycling Company'}
                      </h2>

                      <p>
                        📍 {pickup.company?.city || pickup.city},
                        {' '}
                        {pickup.company?.state || pickup.state}
                      </p>

                    </div>

                  </div>


                  <span
                    className={`pickup-status-pill pickup-status-${pickup.status}`}
                  >
                    {statusInfo.icon}
                    {' '}
                    {statusInfo.label}
                  </span>

                </div>


                {/* DETAILS */}

                <div className="pickup-information-grid">

                  <div className="pickup-information-item">

                    <span>
                      MATERIAL
                    </span>

                    <strong>
                      ♻️ {pickup.material}
                    </strong>

                  </div>


                  <div className="pickup-information-item">

                    <span>
                      ESTIMATED WEIGHT
                    </span>

                    <strong>
                      ⚖️ {pickup.estimatedWeight} kg
                    </strong>

                  </div>


                  <div className="pickup-information-item">

                    <span>
                      PREFERRED DATE
                    </span>

                    <strong>
                      📅 {formatDate(
                        pickup.preferredDate
                      )}
                    </strong>

                  </div>


                  <div className="pickup-information-item">

                    <span>
                      PHONE
                    </span>

                    <strong>
                      📞 {pickup.phone}
                    </strong>

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="pickup-address-panel">

                  <div className="pickup-address-icon">
                    📍
                  </div>

                  <div>

                    <span>
                      PICKUP ADDRESS
                    </span>

                    <strong>
                      {pickup.pickupAddress},
                      {' '}
                      {pickup.city},
                      {' '}
                      {pickup.state}
                    </strong>

                  </div>

                </div>


                {/* TRACKING */}

                {pickup.status !== 'cancelled' && (

                  <div className="pickup-tracker">

                    <div className="pickup-tracker-heading">

                      <span>
                        PICKUP PROGRESS
                      </span>

                      <strong>
                        {statusInfo.label}
                      </strong>

                    </div>


                    <div className="pickup-progress-track">

                      <div
                        className={`pickup-progress-line step-${currentStep}`}
                      />


                      <div
                        className={
                          currentStep >= 1
                            ? 'pickup-progress-step active'
                            : 'pickup-progress-step'
                        }
                      >

                        <div className="pickup-step-circle">
                          ✓
                        </div>

                        <span>
                          Requested
                        </span>

                      </div>


                      <div
                        className={
                          currentStep >= 2
                            ? 'pickup-progress-step active'
                            : 'pickup-progress-step'
                        }
                      >

                        <div className="pickup-step-circle">
                          {currentStep >= 2 ? '✓' : '2'}
                        </div>

                        <span>
                          Accepted
                        </span>

                      </div>


                      <div
                        className={
                          currentStep >= 3
                            ? 'pickup-progress-step active'
                            : 'pickup-progress-step'
                        }
                      >

                        <div className="pickup-step-circle">
                          {currentStep >= 3 ? '✓' : '3'}
                        </div>

                        <span>
                          Collected
                        </span>

                      </div>


                      <div
                        className={
                          currentStep >= 4
                            ? 'pickup-progress-step active'
                            : 'pickup-progress-step'
                        }
                      >

                        <div className="pickup-step-circle">
                          {currentStep >= 4 ? '✓' : '4'}
                        </div>

                        <span>
                          Completed
                        </span>

                      </div>

                    </div>

                  </div>

                )}


                {/* STATUS INFORMATION */}

                <div
                  className={`pickup-current-status pickup-current-${pickup.status}`}
                >

                  <div className="pickup-current-icon">
                    {statusInfo.icon}
                  </div>

                  <div>

                    <strong>
                      {statusInfo.label}
                    </strong>

                    <p>
                      {statusInfo.description}
                    </p>

                  </div>

                </div>


                {/* COMPLETED REWARD */}

                {pickup.status === 'completed' && (

                  <div className="pickup-completed-reward">

                    <div>

                      <span>
                        VERIFIED WEIGHT
                      </span>

                      <strong>
                        ⚖️ {pickup.verifiedWeight || 0} kg
                      </strong>

                    </div>


                    <div>

                      <span>
                        POINTS EARNED
                      </span>

                      <strong>
                        ⭐ +{pickup.pointsAwarded || 0}
                      </strong>

                    </div>

                  </div>

                )}


                {/* NOTES */}

                {pickup.notes && (

                  <div className="pickup-notes">

                    <span>
                      NOTE
                    </span>

                    <p>
                      {pickup.notes}
                    </p>

                  </div>

                )}

              </article>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default MyPickups;