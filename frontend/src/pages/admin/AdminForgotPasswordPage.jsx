import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import SEO from '../../components/seo/SEO.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { requestPasswordReset } from '../../services/authService.js';
import './AdminLoginPage.css';

function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await requestPasswordReset(email);
      showToast({ type: 'success', message: 'If the email exists, a reset code has been sent.' });
      navigate(`/admin/reset-password?email=${encodeURIComponent(email)}`);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to start password recovery.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <SEO title="Forgot Admin Password" canonicalPath="/admin/forgot-password" noindex />
      <form className="admin-login__form admin-login__panel" onSubmit={handleSubmit} noValidate>
        <span className="admin-login__lock"><LockKeyhole size={24} aria-hidden="true" /></span>
        <span className="admin-login__eyebrow">Account Recovery</span>
        <h2>Forgot password?</h2>
        <p>Enter your admin email. If it is registered, you will receive a one-time reset code.</p>
        <label>
          Admin email
          <span className="admin-login__input"><Mail size={17} aria-hidden="true" /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} autoComplete="email" placeholder="admin@example.com" /></span>
        </label>
        {error && <p className="admin-login__error">{error}</p>}
        <button className="admin-login__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Send reset code'}</button>
        <Link className="admin-login__link" to="/admin/login">Back to sign in</Link>
      </form>
    </main>
  );
}

export default AdminForgotPasswordPage;
