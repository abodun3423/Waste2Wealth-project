import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login-recycling.jpg';

function CompanyRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    materialsAccepted: [],
    pickupAvailable: true,
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const materials = [
    'Plastic',
    'Paper',
    'Glass',
    'Metal',
    'Aluminium'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleMaterialChange = (material) => {
    setFormData((previous) => {
      const selected =
        previous.materialsAccepted.includes(material);

      return {
        ...previous,
        materialsAccepted: selected
          ? previous.materialsAccepted.filter(
              (item) => item !== material
            )
          : [
              ...previous.materialsAccepted,
              material
            ]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setSuccess(false);

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage(
        'Password must be at least 6 characters'
      );
      return;
    }

    if (
      formData.materialsAccepted.length === 0
    ) {
      setMessage(
        'Select at least one recyclable material'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'https://waste2wealth-project-3.onrender.com/api/company-auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            companyName: formData.companyName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            materialsAccepted:
              formData.materialsAccepted,
            pickupAvailable:
              formData.pickupAvailable,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            'Company registration failed'
        );
        return;
      }

      setSuccess(true);

      setMessage(
        'Registration successful. Your company account is awaiting administrator verification.'
      );

    } catch (error) {
      console.error(
        'Company registration error:',
        error
      );

      setMessage(
        'Unable to connect to backend'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-register-page">

      <div
        className="company-register-visual"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(5, 70, 45, 0.80),
              rgba(5, 70, 45, 0.80)
            ),
            url(${loginImage})
          `
        }}
      >
        <div className="company-register-visual-content">

          <div className="login-logo">
            ♻️
          </div>

          <h1>Waste2Wealth</h1>

          <h2>Become a Recycling Partner</h2>

          <p>
            Join the Waste2Wealth recycling network,
            receive pickup requests and help transform
            recyclable waste into economic value.
          </p>

          <div className="company-register-benefits">
            <p>✓ Receive recycling pickup requests</p>
            <p>✓ Manage collections digitally</p>
            <p>✓ Verify recyclable materials</p>
            <p>✓ Support a cleaner environment</p>
          </div>

        </div>
      </div>


      <div className="company-register-panel">

        <div className="company-register-card">

          <div className="login-mobile-brand">
            ♻️ Waste2Wealth
          </div>

          <h2>Register Your Company</h2>

          <p className="login-description">
            Create a recycling partner account.
            Your company will be reviewed before
            verification.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="company-form-grid">

              <div className="company-form-group">
                <label className="form-label">
                  Company Name
                </label>

                <input
                  className="input"
                  name="companyName"
                  type="text"
                  placeholder="Company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  Company Email
                </label>

                <input
                  className="input"
                  name="email"
                  type="email"
                  placeholder="Company email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  className="input"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  Business Address
                </label>

                <input
                  className="input"
                  name="address"
                  type="text"
                  placeholder="Business address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  City
                </label>

                <input
                  className="input"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  State
                </label>

                <input
                  className="input"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            <div className="company-material-section">

              <label className="form-label">
                Materials Your Company Accepts
              </label>

              <div className="company-material-options">

                {materials.map((material) => (
                  <label
                    key={material}
                    className="material-checkbox"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.materialsAccepted.includes(
                          material
                        )
                      }
                      onChange={() =>
                        handleMaterialChange(material)
                      }
                    />

                    <span>{material}</span>
                  </label>
                ))}

              </div>

            </div>


            <label className="pickup-checkbox">

              <input
                type="checkbox"
                checked={formData.pickupAvailable}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    pickupAvailable:
                      e.target.checked
                  }))
                }
              />

              <span>
                Our company provides pickup services
              </span>

            </label>


            <div className="company-form-grid">

              <div className="company-form-group">
                <label className="form-label">
                  Password
                </label>

                <input
                  className="input"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="company-form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  className="input"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            <button
              className="primary-button login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Registering Company...'
                : 'Register Company'}
            </button>

          </form>


          {message && (
            <p
              className={
                success
                  ? 'company-success-message'
                  : 'error-message'
              }
            >
              {message}
            </p>
          )}


          <div className="company-login-link">

            Already registered?{' '}

            <button
              type="button"
              onClick={() =>
                navigate('/company/login')
              }
            >
              Sign In as Company
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CompanyRegister;
