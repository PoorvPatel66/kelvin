import { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createAdminNavigationItem, deleteAdminNavigationItem, fetchAdminNavigation, updateAdminNavigationItem } from '../../services/adminSiteConfigurationService.js';
import './AdminWebsiteControls.css';

const empty = { label: '', path: '', area: 'HEADER', sortOrder: 10, isVisible: true, isExternal: false };
const areas = ['HEADER', 'FOOTER_QUICK', 'FOOTER_MORE', 'FOOTER_SERVICES'];

function AdminNavigationPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try { setItems(await fetchAdminNavigation()); }
    catch { showToast({ type: 'error', message: 'Unable to load navigation.' }); }
  }
  useEffect(() => { load(); }, []);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value }));
  }
  function edit(item) { setEditingId(item.id); setForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset() { setEditingId(null); setForm(empty); }

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      if (editingId) await updateAdminNavigationItem(editingId, form); else await createAdminNavigationItem(form);
      await load(); reset(); showToast({ type: 'success', message: editingId ? 'Navigation item updated.' : 'Navigation item created.' });
    } catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save navigation item.' }); }
    finally { setSaving(false); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    try { await deleteAdminNavigationItem(item.id); await load(); showToast({ type: 'success', message: 'Navigation item deleted.' }); }
    catch { showToast({ type: 'error', message: 'Unable to delete navigation item.' }); }
  }

  return (
    <main className="admin-content admin-website-controls">
      <PageHeader eyebrow="Website" title="Navigation" description="Control header and footer links, order, visibility, and external destinations." />
      <section className="admin-control-card">
        <form className="admin-control-form admin-navigation-form" onSubmit={submit}>
          <label>Label<input name="label" value={form.label} onChange={change} required /></label>
          <label>Path or URL<input name="path" value={form.path} onChange={change} required /></label>
          <label>Area<select name="area" value={form.area} onChange={change}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
          <label>Order<input name="sortOrder" type="number" min="0" value={form.sortOrder} onChange={change} /></label>
          <label className="admin-check"><input name="isVisible" type="checkbox" checked={form.isVisible} onChange={change} />Visible</label>
          <label className="admin-check"><input name="isExternal" type="checkbox" checked={form.isExternal} onChange={change} />External link</label>
          <div className="admin-control-form__wide"><button className="admin-primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update item' : 'Add item'}</button>{editingId && <button className="admin-secondary-button" type="button" onClick={reset}>Cancel</button>}</div>
        </form>
      </section>
      <section className="admin-control-card admin-navigation-list">
        {items.map((item) => <article key={item.id}><div><strong>{item.label}</strong><span>{item.area} · order {item.sortOrder} · {item.isVisible ? 'visible' : 'hidden'}</span><small>{item.path}</small></div><div><button onClick={() => edit(item)} aria-label={`Edit ${item.label}`}><Edit3 size={16} /></button><button onClick={() => remove(item)} aria-label={`Delete ${item.label}`}><Trash2 size={16} /></button></div></article>)}
      </section>
    </main>
  );
}

export default AdminNavigationPage;
