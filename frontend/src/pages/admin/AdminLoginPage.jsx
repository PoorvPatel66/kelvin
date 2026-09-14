import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import SEO from '../../components/seo/SEO.jsx';
import { requestOwnerOtp } from '../../services/authService.js';
import './AdminLoginPage.css';

const initialForm = {
  ownerName: '',
  mobile: '',
  password: '',
  otp: ''
};

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginWithOwnerOtp } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [otpRequested, setOtpRequested] = useState(false);
  const [developmentOtp, setDevelopmentOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function handleRequestOtp(event) {
    event.preventDefault();

    if (!form.ownerName || !form.mobile || !form.password) {
      setError('Owner name, mobile number, and admin password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await requestOwnerOtp({
        ownerName: form.ownerName,
        mobile: form.mobile,
        password: form.password
      });
      setOtpRequested(true);
      setDevelopmentOtp(response.developmentOtp || '');
      showToast({ type: 'success', message: response.message || 'Verification code sent.' });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Invalid owner credentials.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (!form.otp) {
      setError('OTP is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithOwnerOtp(form);
      showToast({ type: 'success', message: 'Welcome back.' });
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Invalid OTP.';
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <SEO title="Admin Login" canonicalPath="/admin/login" noindex />
      <section className="admin-login__panel" aria-labelledby="admin-login-title">
        <div className="admin-login__visual">
          <span className="admin-login__badge">Kelvin Eco Products</span>
          <h1 id="admin-login-title">Admin Control Center</h1>
          <p>Secure access for product catalog, media, dashboard, and operational content management.</p>
          <div className="admin-login__metrics" aria-label="Admin capabilities">
            <span>Catalog</span>
            <span>Media</span>
            <span>Dashboard</span>
          </div>
        </div>

        <form
          className="admin-login__form"
          onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}
          noValidate
        >
          <span className="admin-login__lock">
            <LockKeyhole size={24} aria-hidden="true" />
          </span>
          <span className="admin-login__eyebrow">Owner Verification</span>
          <h2>Admin OTP Login</h2>
          <p>Enter owner details, request OTP, then verify to open the dashboard.</p>

          <label>
            Owner Name
            <span className="admin-login__input">
              <UserRound size={17} aria-hidden="true" />
              <input
                id="admin-owner-name"
                name="ownerName"
                type="text"
                value={form.ownerName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="vasu poorv"
                disabled={otpRequested}
              />
            </span>
          </label>

          <label>
            Mobile Number
            <span className="admin-login__input">
              <Phone size={17} aria-hidden="true" />
              <input
                id="admin-mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="+91 9687 503514"
                disabled={otpRequested}
              />
            </span>
          </label>

          <label>
            Admin Password
            <span className="admin-login__input">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Enter password"
                disabled={otpRequested}
              />
            </span>
          </label>

          {otpRequested && (
            <label>
              OTP
              <span className="admin-login__input">
                <ShieldCheck size={17} aria-hidden="true" />
                <input
                  id="admin-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.otp}
                  onChange={handleChange}
                  autoComplete="one-time-code"
                  placeholder="Enter 6 digit OTP"
                />
              </span>
            </label>
          )}

          {error && <p className="admin-login__error">{error}</p>}

          {developmentOtp && (
            <p className="admin-login__dev-otp" role="status">
              Development OTP: <strong>{developmentOtp}</strong>
            </p>
          )}

          <button className="admin-login__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : otpRequested ? 'Verify OTP & Sign In' : 'Request OTP'}
          </button>

          {otpRequested && (
            <button
              className="admin-login__reset"
              type="button"
              onClick={() => {
                setOtpRequested(false);
                setDevelopmentOtp('');
                setForm((current) => ({ ...current, otp: '' }));
                setError('');
              }}
            >
              Change owner details
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

export default AdminLoginPage;
