import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminSiteSettings, updateAdminSiteSettings } from '../../services/adminSiteConfigurationService.js';
import './AdminWebsiteControls.css';

const fields = [
  ['siteName', 'Site name'], ['tagline', 'Tagline'], ['logoUrl', 'Logo URL'], ['primaryPhone', 'Primary phone'],
  ['alternatePhone', 'Alternate phone'], ['primaryEmail', 'Primary email'], ['alternateEmail', 'Alternate email'],
  ['websiteUrl', 'Website URL'], ['whatsappNumber', 'WhatsApp number'], ['businessHours', 'Business hours']
];
const socialFields = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter'];

function AdminSiteSettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ socialLinks: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminSiteSettings().then(setForm).catch(() => showToast({ type: 'error', message: 'Unable to load site settings.' })).finally(() => setLoading(false));
  }, [showToast]);

  function change(event) { setForm((value) => ({ ...value, [event.target.name]: event.target.value })); }
  function changeSocial(event) { setForm((value) => ({ ...value, socialLinks: { ...(value.socialLinks || {}), [event.target.name]: event.target.value } })); }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setForm(await updateAdminSiteSettings(form));
      showToast({ type: 'success', message: 'Site settings updated.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save site settings.' });
    } finally { setSaving(false); }
  }

  return (
    <main className="admin-content admin-website-controls">
      <PageHeader eyebrow="Website" title="Site Settings" description="Manage shared branding and contact details used by the public website." />
      <section className="admin-control-card">
        {loading ? <p>Loading settings...</p> : (
          <form className="admin-control-form" onSubmit={submit}>
            {fields.map(([name, label]) => <label key={name}>{label}<input name={name} value={form[name] || ''} onChange={change} /></label>)}
            <label className="admin-control-form__wide">Footer description<textarea name="footerDescription" value={form.footerDescription || ''} onChange={change} /></label>
            <label className="admin-control-form__wide">Head office<textarea name="headOffice" value={form.headOffice || ''} onChange={change} /></label>
            <label className="admin-control-form__wide">Corporate office<textarea name="corporateOffice" value={form.corporateOffice || ''} onChange={change} /></label>
            <fieldset className="admin-control-form__wide"><legend>Social links</legend><div className="admin-control-form">{socialFields.map((name) => <label key={name}>{name}<input name={name} value={form.socialLinks?.[name] || ''} onChange={changeSocial} /></label>)}</div></fieldset>
            <div className="admin-control-form__wide"><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button></div>
          </form>
        )}
      </section>
    </main>
  );
}

export default AdminSiteSettingsPage;
