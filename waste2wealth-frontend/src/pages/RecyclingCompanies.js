import React, { useState } from 'react';

function RecyclingCompanies() {
  const [companies, setCompanies] = useState([]);

  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [material, setMaterial] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationUsed, setLocationUsed] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // PICKUP
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [pickupForm, setPickupForm] = useState({
    material: '',
    estimatedWeight: '',
    pickupAddress: '',
    city: '',
    state: '',
    phone: '',
    preferredDate: '',
    notes: ''
  });

  const [pickupMessage, setPickupMessage] = useState('');
  const [submittingPickup, setSubmittingPickup] = useState(false);

  const token = localStorage.getItem('token');


  // ==========================================
  // SEARCH COMPANIES
  // ==========================================

  const searchCompanies = async (params = {}) => {
    try {
      setLoading(true);
      setMessage('');
      setHasSearched(true);

      const query = new URLSearchParams();

      if (companyName.trim()) {
        query.append('companyName', companyName.trim());
      }

      if (city.trim()) {
        query.append('city', city.trim());
      }

      if (state.trim()) {
        query.append('state', state.trim());
      }

      if (material) {
        query.append('material', material);
      }

      if (params.latitude) {
        query.append('latitude', params.latitude);
      }

      if (params.longitude) {
        query.append('longitude', params.longitude);
      }

      query.append('pickupAvailable', 'true');

      const response = await fetch(
        `https://waste2wealth-project-3.onrender.com/api/companies?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to load recycling companies'
        );
      }

      setCompanies(data);

      if (data.length === 0) {
        setMessage(
          'No recycling companies matched your search. Try another company name, city, state or material.'
        );
      }

    } catch (error) {
      console.error('Company search error:', error);
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  };


  const handleManualSearch = (event) => {
    event.preventDefault();

    setLocationUsed(false);
    searchCompanies();
  };


  // ==========================================
  // LOCATION SEARCH
  // ==========================================

  const handleUseLocation = () => {
    setMessage('');

    if (!navigator.geolocation) {
      setMessage(
        'Location is not supported by this browser.'
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocationUsed(true);

        searchCompanies({
          latitude,
          longitude
        });
      },

      (error) => {
        setLoading(false);

        console.error('Location error:', error);

        if (error.code === 1) {
          setMessage(
            'Location permission was denied. Search manually instead.'
          );
        } else {
          setMessage(
            'Unable to get your location. Please try manual search.'
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };


  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const clearSearch = () => {
    setCompanyName('');
    setCity('');
    setState('');
    setMaterial('');
    setCompanies([]);
    setMessage('');
    setHasSearched(false);
    setLocationUsed(false);
  };


  // ==========================================
  // OPEN PICKUP
  // ==========================================

  const openPickupForm = (company) => {
    setSelectedCompany(company);
    setPickupMessage('');

    setPickupForm({
      material: '',
      estimatedWeight: '',
      pickupAddress: '',
      city: company.city || '',
      state: company.state || '',
      phone: '',
      preferredDate: '',
      notes: ''
    });
  };


  const handlePickupChange = (event) => {
    const { name, value } = event.target;

    setPickupForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };


  // ==========================================
  // SUBMIT PICKUP TO BACKEND
  // ==========================================

  const handlePickupSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCompany) return;

    try {
      setSubmittingPickup(true);
      setPickupMessage('');

      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/pickups',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            companyId: selectedCompany._id,
            material: pickupForm.material,
            estimatedWeight: Number(
              pickupForm.estimatedWeight
            ),
            pickupAddress: pickupForm.pickupAddress,
            city: pickupForm.city,
            state: pickupForm.state,
            phone: pickupForm.phone,
            preferredDate: pickupForm.preferredDate,
            notes: pickupForm.notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create pickup request'
        );
      }

      setPickupMessage(
        'Pickup request submitted successfully!'
      );

      setPickupForm({
        material: '',
        estimatedWeight: '',
        pickupAddress: '',
        city: selectedCompany.city || '',
        state: selectedCompany.state || '',
        phone: '',
        preferredDate: '',
        notes: ''
      });

    } catch (error) {
      console.error('Pickup request error:', error);
      setPickupMessage(error.message);

    } finally {
      setSubmittingPickup(false);
    }
  };


  return (
    <div className="page-container recycling-page">

      {/* HERO */}

      <section className="recycling-hero">

        <div className="recycling-hero-content">

          <span className="recycling-eyebrow">
            ♻️ WASTE2WEALTH RECYCLING NETWORK
          </span>

          <h1>
            Find the Right Recycling
            Partner Near You
          </h1>

          <p>
            Connect with recycling companies that accept
            your materials and arrange convenient pickup
            services from one place.
          </p>

          <div className="recycling-hero-stats">

            <div>
              <strong>♻️</strong>
              <span>Recycle Responsibly</span>
            </div>

            <div>
              <strong>📍</strong>
              <span>Find Nearby Partners</span>
            </div>

            <div>
              <strong>🚚</strong>
              <span>Request Pickup</span>
            </div>

          </div>

        </div>

        <div className="recycling-hero-art">
          <div className="recycling-art-circle">
            ♻️
          </div>
        </div>

      </section>


      {/* SEARCH */}

      <section className="recycling-search-card">

        <div className="recycling-section-heading">

          <div className="recycling-heading-icon">
            🔎
          </div>

          <div>
            <h2>Find a Recycling Company</h2>

            <p>
              Search by company name, location or the
              material you want to recycle.
            </p>
          </div>

        </div>


        <form
          className="recycling-search-form"
          onSubmit={handleManualSearch}
        >

          <div className="recycling-field company-name-field">

            <label>
              Company Name
            </label>

            <input
              type="text"
              placeholder="Search e.g. EcoWaste Ado"
              value={companyName}
              onChange={(event) =>
                setCompanyName(event.target.value)
              }
            />

          </div>


          <div className="recycling-field">

            <label>City</label>

            <input
              type="text"
              placeholder="e.g. Ado-Ekiti"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
            />

          </div>


          <div className="recycling-field">

            <label>State</label>

            <input
              type="text"
              placeholder="e.g. Ekiti"
              value={state}
              onChange={(event) =>
                setState(event.target.value)
              }
            />

          </div>


          <div className="recycling-field">

            <label>Material</label>

            <select
              value={material}
              onChange={(event) =>
                setMaterial(event.target.value)
              }
            >

              <option value="">
                All Materials
              </option>

              <option value="Plastic">
                Plastic
              </option>

              <option value="Paper">
                Paper
              </option>

              <option value="Glass">
                Glass
              </option>

              <option value="Aluminium">
                Aluminium
              </option>

              <option value="Metal">
                Metal
              </option>

              <option value="E-waste">
                E-waste
              </option>

            </select>

          </div>


          <div className="recycling-search-actions">

            <button
              type="submit"
              className="recycling-search-btn"
              disabled={loading}
            >
              {loading
                ? 'Searching...'
                : '🔍 Search Companies'}
            </button>


            <button
              type="button"
              className="recycling-location-btn"
              onClick={handleUseLocation}
              disabled={loading}
            >
              📍 Use My Location
            </button>


            <button
              type="button"
              className="recycling-clear-btn"
              onClick={clearSearch}
            >
              Clear
            </button>

          </div>

        </form>

      </section>


      {/* LOCATION MESSAGE */}

      {locationUsed && companies.length > 0 && (

        <div className="recycling-success-message">
          ✓ Showing recycling companies nearest
          to your current location.
        </div>

      )}


      {/* ERROR / EMPTY SEARCH MESSAGE */}

      {message && (

        <div className="recycling-message">
          {message}
        </div>

      )}


      {/* RESULTS HEADER */}

      {hasSearched && !loading && companies.length > 0 && (

        <div className="recycling-results-header">

          <div>
            <span className="results-label">
              SEARCH RESULTS
            </span>

            <h2>
              Recycling Companies
            </h2>

            <p>
              {companies.length}{' '}
              {companies.length === 1
                ? 'company'
                : 'companies'}{' '}
              found
            </p>
          </div>

        </div>

      )}


      {/* LOADING */}

      {loading && (

        <div className="recycling-loading">

          <div className="recycling-spinner">
            ♻️
          </div>

          <h3>
            Finding recycling companies...
          </h3>

          <p>
            Searching our recycling network.
          </p>

        </div>

      )}


      {/* COMPANY CARDS */}

      {!loading && companies.length > 0 && (

        <div className="recycling-company-grid">

          {companies.map((company) => (

            <article
              className="recycling-company-card"
              key={company._id}
            >

              <div className="recycling-card-header">

                <div className="recycling-company-logo">
                  ♻️
                </div>

                <div className="recycling-company-heading">

                  <div className="recycling-name-line">

                    <h3>
                      {company.companyName}
                    </h3>

                    {company.verified && (
                      <span className="recycling-verified">
                        ✓ Verified
                      </span>
                    )}

                  </div>

                  <p>
                    📍 {company.address},
                    {' '}
                    {company.city},
                    {' '}
                    {company.state}
                  </p>

                </div>

              </div>


              <div className="recycling-card-badges">

                {company.pickupAvailable && (

                  <span className="recycling-pickup-badge">
                    🚚 Pickup Available
                  </span>

                )}

                {company.distanceKm !== null &&
                  company.distanceKm !== undefined && (

                  <span className="recycling-distance-badge">
                    📍 {company.distanceKm} km away
                  </span>

                )}

              </div>


              <div className="recycling-material-section">

                <span className="recycling-small-label">
                  MATERIALS ACCEPTED
                </span>

                <div className="recycling-material-tags">

                  {company.materialsAccepted?.map(
                    (acceptedMaterial) => (

                      <span key={acceptedMaterial}>
                        {acceptedMaterial}
                      </span>

                    )
                  )}

                </div>

              </div>


              <div className="recycling-contact-grid">

                <div>
                  <span>Phone</span>
                  <strong>
                    {company.phone}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {company.email}
                  </strong>
                </div>

              </div>


              <div className="recycling-card-actions">

                <button
                  type="button"
                  className="recycling-details-btn"
                >
                  View Details
                </button>

                <button
                  type="button"
                  className="recycling-pickup-btn"
                  disabled={!company.pickupAvailable}
                  onClick={() =>
                    openPickupForm(company)
                  }
                >
                  🚚 Request Pickup
                </button>

              </div>

            </article>

          ))}

        </div>

      )}


      {/* INITIAL EMPTY STATE */}

      {!loading &&
        !hasSearched &&
        companies.length === 0 && (

        <div className="recycling-empty">

          <div className="recycling-empty-icon">
            ♻️
          </div>

          <h2>
            Ready to recycle?
          </h2>

          <p>
            Search for a recycling company above or use
            your location to find pickup services near you.
          </p>

        </div>

      )}


      {/* PICKUP MODAL */}

      {selectedCompany && (

        <div className="pickup-overlay">

          <div className="pickup-modal">

            <div className="pickup-modal-header">

              <div>

                <span className="pickup-modal-label">
                  🚚 PICKUP REQUEST
                </span>

                <h2>
                  Schedule Your Recycling Pickup
                </h2>

                <p>
                  Sending request to{' '}
                  <strong>
                    {selectedCompany.companyName}
                  </strong>
                </p>

              </div>


              <button
                type="button"
                className="pickup-close-button"
                onClick={() =>
                  setSelectedCompany(null)
                }
              >
                ×
              </button>

            </div>


            <form
              className="pickup-form"
              onSubmit={handlePickupSubmit}
            >

              <div className="pickup-form-field">

                <label>
                  Material
                </label>

                <select
                  name="material"
                  value={pickupForm.material}
                  onChange={handlePickupChange}
                  required
                >

                  <option value="">
                    Select material
                  </option>

                  {selectedCompany.materialsAccepted?.map(
                    (acceptedMaterial) => (

                      <option
                        key={acceptedMaterial}
                        value={acceptedMaterial}
                      >
                        {acceptedMaterial}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="pickup-form-field">

                <label>
                  Estimated Weight (kg)
                </label>

                <input
                  type="number"
                  name="estimatedWeight"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 5"
                  value={pickupForm.estimatedWeight}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field pickup-full-width">

                <label>
                  Pickup Address
                </label>

                <input
                  type="text"
                  name="pickupAddress"
                  placeholder="Enter your complete pickup address"
                  value={pickupForm.pickupAddress}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field">

                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={pickupForm.city}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field">

                <label>State</label>

                <input
                  type="text"
                  name="state"
                  value={pickupForm.state}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 08012345678"
                  value={pickupForm.phone}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field">

                <label>
                  Preferred Pickup Date
                </label>

                <input
                  type="date"
                  name="preferredDate"
                  value={pickupForm.preferredDate}
                  onChange={handlePickupChange}
                  required
                />

              </div>


              <div className="pickup-form-field pickup-full-width">

                <label>
                  Additional Notes
                </label>

                <textarea
                  name="notes"
                  placeholder="Any instructions for the recycling company..."
                  value={pickupForm.notes}
                  onChange={handlePickupChange}
                />

              </div>


              {pickupMessage && (

                <div className="pickup-response-message pickup-full-width">
                  {pickupMessage}
                </div>

              )}


              <div className="pickup-form-actions pickup-full-width">

                <button
                  type="button"
                  className="pickup-cancel-btn"
                  onClick={() =>
                    setSelectedCompany(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="recycling-pickup-btn"
                  disabled={submittingPickup}
                >
                  {submittingPickup
                    ? 'Submitting...'
                    : '🚚 Submit Pickup Request'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default RecyclingCompanies;