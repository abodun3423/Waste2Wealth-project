import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminCompanies() {

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/admin/companies',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load companies');
      }

      setCompanies(data.companies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerification = async (company) => {
    try {
      setUpdatingId(company._id);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        `https://waste2wealth-project-3.onrender.com/api/admin/companies/${company._id}/verification`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            verified: !company.verified
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to update company verification'
        );
      }

      setCompanies((currentCompanies) =>
        currentCompanies.map((item) =>
          item._id === company._id
            ? {
                ...item,
                verified: data.company.verified
              }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        company.companyName?.toLowerCase().includes(searchText) ||
        company.email?.toLowerCase().includes(searchText) ||
        company.city?.toLowerCase().includes(searchText) ||
        company.state?.toLowerCase().includes(searchText);

      let matchesFilter = true;

      if (filter === 'verified') {
        matchesFilter = company.verified === true;
      }

      if (filter === 'unverified') {
        matchesFilter = company.verified !== true;
      }

      if (filter === 'pickup') {
        matchesFilter = company.pickupAvailable === true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [companies, search, filter]);

  const totalVerified = companies.filter(
    (company) => company.verified
  ).length;

  const totalUnverified = companies.length - totalVerified;

  const totalPickupAvailable = companies.filter(
    (company) => company.pickupAvailable
  ).length;

  

  return (
    <div className="admin-page">
     <AdminSidebar activePage="companies" />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-eyebrow">
              COMPANY MANAGEMENT
            </p>

            <h1>Recycling Companies</h1>

            <p>
              Review recycling partners, monitor their activity
              and manage company verification.
            </p>
          </div>

          <div className="admin-topbar-badge">
            Administrator
          </div>
        </div>

        {error && (
          <div className="admin-companies-error">
            {error}
          </div>
        )}

        <section className="admin-company-summary">
          <div className="admin-company-summary-card">
            <span>Total Companies</span>
            <strong>{companies.length}</strong>
            <small>Registered recycling partners</small>
          </div>

          <div className="admin-company-summary-card">
            <span>Verified</span>
            <strong>{totalVerified}</strong>
            <small>Approved companies</small>
          </div>

          <div className="admin-company-summary-card">
            <span>Awaiting Verification</span>
            <strong>{totalUnverified}</strong>
            <small>Require administrator review</small>
          </div>

          <div className="admin-company-summary-card">
            <span>Pickup Available</span>
            <strong>{totalPickupAvailable}</strong>
            <small>Currently accepting pickups</small>
          </div>
        </section>

        <section className="admin-company-panel">
          <div className="admin-company-toolbar">
            <div>
              <h2>Company Directory</h2>
              <p>
                {filteredCompanies.length} compan
                {filteredCompanies.length === 1 ? 'y' : 'ies'} shown
              </p>
            </div>

            <div className="admin-company-controls">
              <input
                type="text"
                placeholder="Search company, email or location..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
              >
                <option value="all">
                  All Companies
                </option>

                <option value="verified">
                  Verified
                </option>

                <option value="unverified">
                  Awaiting Verification
                </option>

                <option value="pickup">
                  Pickup Available
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-company-message">
              Loading recycling companies...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="admin-company-message">
              No recycling companies match your search.
            </div>
          ) : (
            <div className="admin-company-grid">
              {filteredCompanies.map((company) => (
                <article
                  className="admin-company-card"
                  key={company._id}
                >
                  <div className="admin-company-card-header">
                    <div className="admin-company-avatar">
                      ♻
                    </div>

                    <div className="admin-company-title">
                      <h3>{company.companyName}</h3>

                      <span
                        className={
                          company.verified
                            ? 'company-status verified'
                            : 'company-status unverified'
                        }
                      >
                        {company.verified
                          ? 'Verified'
                          : 'Awaiting Verification'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-company-details">
                    <div>
                      <span>Email</span>
                      <strong>{company.email}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{company.phone}</strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>
                        {company.city}, {company.state}
                      </strong>
                    </div>

                    <div>
                      <span>Pickup Service</span>
                      <strong>
                        {company.pickupAvailable
                          ? 'Available'
                          : 'Unavailable'}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-company-materials">
                    <span>Accepted Materials</span>

                    <div>
                      {company.materialsAccepted?.length > 0 ? (
                        company.materialsAccepted.map(
                          (material, index) => (
                            <small key={index}>
                              {material}
                            </small>
                          )
                        )
                      ) : (
                        <small>No materials listed</small>
                      )}
                    </div>
                  </div>

                  <div className="admin-company-activity">
                    <div>
                      <strong>
                        {company.activity?.totalPickups || 0}
                      </strong>
                      <span>Total Pickups</span>
                    </div>

                    <div>
                      <strong>
                        {company.activity?.pendingPickups || 0}
                      </strong>
                      <span>Pending</span>
                    </div>

                    <div>
                      <strong>
                        {company.activity?.completedPickups || 0}
                      </strong>
                      <span>Completed</span>
                    </div>
                  </div>

                  <div className="admin-company-card-footer">
                    <span>
                      Joined{' '}
                      {company.createdAt
                        ? new Date(
                            company.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>

                    <button
                      className={
                        company.verified
                          ? 'company-unverify-button'
                          : 'company-verify-button'
                      }
                      onClick={() =>
                        handleVerification(company)
                      }
                      disabled={
                        updatingId === company._id
                      }
                    >
                      {updatingId === company._id
                        ? 'Updating...'
                        : company.verified
                        ? 'Remove Verification'
                        : 'Verify Company'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminCompanies;
