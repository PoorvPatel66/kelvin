import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import SEO from '../../components/seo/SEO.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { resetPassword } from '../../services/authService.js';
import './AdminLoginPage.css';

function AdminResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: new URLSearchParams(location.search).get('email') || '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({ email: form.email, otp: form.otp, password: form.password });
      showToast({ type: 'success', message: 'Password changed successfully.' });
      navigate('/admin', { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <SEO title="Reset Admin Password" canonicalPath="/admin/reset-password" noindex />
      <form className="admin-login__form admin-login__panel" onSubmit={handleSubmit} noValidate>
        <span className="admin-login__lock"><LockKeyhole size={24} aria-hidden="true" /></span>
        <span className="admin-login__eyebrow">Account Recovery</span>
        <h2>Set a new password</h2>
        <p>Use the one-time code sent to your email. The code expires after 10 minutes.</p>
        <label>Email<span className="admin-login__input"><KeyRound size={17} aria-hidden="true" /><input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" /></span></label>
        <label>Reset code<span className="admin-login__input"><ShieldCheck size={17} aria-hidden="true" /><input name="otp" inputMode="numeric" maxLength={6} value={form.otp} onChange={handleChange} autoComplete="one-time-code" /></span></label>
        <label>New password<span className="admin-login__input"><LockKeyhole size={17} aria-hidden="true" /><input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" /></span></label>
        <label>Confirm password<span className="admin-login__input"><LockKeyhole size={17} aria-hidden="true" /><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" /></span></label>
        {error && <p className="admin-login__error">{error}</p>}
        <button className="admin-login__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Reset password'}</button>
        <Link className="admin-login__link" to="/admin/login">Back to sign in</Link>
      </form>
    </main>
  );
}

export default AdminResetPasswordPage;
