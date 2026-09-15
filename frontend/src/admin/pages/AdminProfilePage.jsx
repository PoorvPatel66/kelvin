import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  changeAdminPassword,
  getAdminProfile,
  requestAdminEmailChange,
  requestAdminPhoneChange,
  updateAdminProfile,
  verifyAdminEmailChange,
  verifyAdminPhoneChange
} from '../../services/authService.js';
import './AdminProfilePage.css';

const emptyProfile = { name: '', email: '', mobile: '', emailVerified: false, phoneVerified: false };

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Unavailable';
}

function ErrorMessage({ message }) {
  return message ? <p className="admin-profile__message admin-profile__message--error">{message}</p> : null;
}

function Status({ verified }) {
  return <span className={`admin-profile__status ${verified ? 'is-verified' : ''}`}>{verified ? 'Verified' : 'Not verified'}</span>;
}

function AdminProfilePage() {
  const { updateAdmin } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState('idle');
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState('idle');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data || emptyProfile);
        setForm({ name: data?.name || '' });
        setEmail(data?.email || '');
        setPhone(data?.mobile || '');
      })
      .catch((error) => setProfileError(error.response?.data?.message || 'Unable to load profile.'))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, []);

  function applyProfile(data) {
    setProfile(data);
    setForm({ name: data.name || '' });
    setEmail(data.email || '');
    setPhone(data.mobile || '');
    updateAdmin(data);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileError('');
    if (form.name.trim().length < 2) return setProfileError('Full name must be at least 2 characters.');
    try {
      setIsSaving(true);
      const result = await updateAdminProfile({ name: form.name });
      applyProfile(result.profile);
      showToast({ type: 'success', message: result.message });
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Unable to save profile.');
    } finally {
      setIsSaving(false);
    }
  }

  async function requestEmail() {
    try {
      const result = await requestAdminEmailChange(email);
      setEmailStep('verify');
      showToast({ type: 'success', message: result.developmentOtp ? `Development OTP: ${result.developmentOtp}` : result.message });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to send email OTP.' }); }
  }

  async function verifyEmail() {
    try {
      const result = await verifyAdminEmailChange({ email, otp: emailOtp });
      applyProfile(result.profile); setEmailStep('idle'); setEmailOtp('');
      showToast({ type: 'success', message: result.message });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to verify email.' }); }
  }

  async function requestPhone() {
    try {
      const result = await requestAdminPhoneChange(phone);
      setPhoneStep('verify');
      showToast({ type: 'success', message: result.developmentOtp ? `Development OTP: ${result.developmentOtp}` : result.message });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to send phone OTP.' }); }
  }

  async function verifyPhone() {
    try {
      const result = await verifyAdminPhoneChange({ phone, otp: phoneOtp });
      applyProfile(result.profile); setPhoneStep('idle'); setPhoneOtp('');
      showToast({ type: 'success', message: result.message });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to verify phone.' }); }
  }

  async function submitPassword(event) {
    event.preventDefault();
    try {
      setIsChangingPassword(true);
      const result = await changeAdminPassword(passwords);
      applyProfile(result.profile); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast({ type: 'success', message: result.message });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to change password.' }); }
    finally { setIsChangingPassword(false); }
  }

  if (isLoading) return <main className="admin-profile"><p>Loading profile...</p></main>;

  return (
    <main className="admin-profile">
      <div className="admin-profile__intro"><div><span>Account</span><h2>Profile</h2><p>Manage your personal details and account security.</p></div><ShieldCheck size={42} /></div>
      <ErrorMessage message={profileError} />
      <section className="admin-profile__grid">
        <article className="admin-profile__card admin-profile__card--wide">
          <div className="admin-profile__card-heading"><UserRound size={20} /><div><h3>Personal details</h3><p>Only your authenticated account can update these details.</p></div></div>
          <form onSubmit={saveProfile} className="admin-profile__form">
            <label>Full name<input value={form.name} onChange={(event) => setForm({ name: event.target.value })} autoComplete="name" /></label>
            <label>Email<input value={profile.email} readOnly aria-describedby="email-status" /><small id="email-status"><Status verified={profile.emailVerified} /> Change it in Verification below.</small></label>
            <label>Phone number<input value={profile.mobile || ''} readOnly aria-describedby="phone-status" /><small id="phone-status"><Status verified={profile.phoneVerified} /> Change it in Verification below.</small></label>
            <button className="admin-profile__primary" disabled={isSaving}><Save size={16} />{isSaving ? 'Saving...' : 'Save profile'}</button>
          </form>
        </article>

        <article className="admin-profile__card">
          <div className="admin-profile__card-heading"><Mail size={20} /><div><h3>Change email</h3><p>We will verify the new address before saving it.</p></div></div>
          <div className="admin-profile__form"><label>New email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={emailStep === 'verify'} /></label>
            {emailStep === 'verify' ? <><label>Verification code<input inputMode="numeric" value={emailOtp} onChange={(event) => setEmailOtp(event.target.value)} maxLength={6} /></label><div className="admin-profile__actions"><button className="admin-profile__primary" type="button" onClick={verifyEmail} disabled={!emailOtp}>Verify email</button><button className="admin-profile__secondary" type="button" onClick={() => setEmailStep('idle')}>Cancel</button></div></> : <button className="admin-profile__secondary" type="button" onClick={requestEmail}>Send verification code</button>}
          </div>
        </article>

        <article className="admin-profile__card">
          <div className="admin-profile__card-heading"><Phone size={20} /><div><h3>Change phone</h3><p>We will verify the new number before saving it.</p></div></div>
          <div className="admin-profile__form"><label>New phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={phoneStep === 'verify'} /></label>
            {phoneStep === 'verify' ? <><label>Verification code<input inputMode="numeric" value={phoneOtp} onChange={(event) => setPhoneOtp(event.target.value)} maxLength={6} /></label><div className="admin-profile__actions"><button className="admin-profile__primary" type="button" onClick={verifyPhone} disabled={!phoneOtp}>Verify phone</button><button className="admin-profile__secondary" type="button" onClick={() => setPhoneStep('idle')}>Cancel</button></div></> : <button className="admin-profile__secondary" type="button" onClick={requestPhone}>Send verification code</button>}
          </div>
        </article>

        <article className="admin-profile__card admin-profile__card--wide">
          <div className="admin-profile__card-heading"><KeyRound size={20} /><div><h3>Security</h3><p>Changing your password revokes older authentication sessions.</p></div></div>
          <form onSubmit={submitPassword} className="admin-profile__form admin-profile__password-form">
            <label>Current password<input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} autoComplete="current-password" /></label>
            <label>New password<input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} autoComplete="new-password" /></label>
            <label>Confirm new password<input type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} autoComplete="new-password" /></label>
            <button className="admin-profile__primary" disabled={isChangingPassword}><CheckCircle2 size={16} />{isChangingPassword ? 'Changing...' : 'Change password'}</button>
          </form>
        </article>

        <article className="admin-profile__card admin-profile__account"><h3>Account</h3><dl><dt>Status</dt><dd>{profile.isActive ? 'Active' : 'Inactive'}</dd><dt>Created</dt><dd>{formatDate(profile.createdAt)}</dd><dt>Role</dt><dd>{profile.role || 'ADMIN'}</dd></dl></article>
      </section>
    </main>
  );
}

export default AdminProfilePage;