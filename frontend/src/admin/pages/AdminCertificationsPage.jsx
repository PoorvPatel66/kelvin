import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Edit3, ImagePlus, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminCertification,
  deleteAdminCertification,
  deleteCertificationImage,
  fetchAdminCertifications,
  updateAdminCertification,
  uploadCertificationImage
} from '../../services/certificationService.js';
import './AdminCertificationsPage.css';

const emptyForm = {
  title: '',
  issuer: '',
  certificateNumber: '',
  description: '',
  issueDate: '',
  expiryDate: '',
  icon: '',
  pdfUrl: '',
  status: 'DRAFT',
  sortOrder: 0
};

function dateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function displayDate(value) {
  return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)) : 'Not set';
}

function AdminCertificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await fetchAdminCertifications());
    } catch {
      showToast({ type: 'error', message: 'Unable to load certifications.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => [item.title, item.issuer, item.certificateNumber, item.description]
      .filter(Boolean).some((value) => value.toLowerCase().includes(term)));
  }, [items, search]);

  const currentItem = useMemo(
    () => items.find((item) => item.id === editingId) || null,
    [editingId, items]
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setImageFile(null);
    setForm({
      title: item.title || '',
      issuer: item.issuer || '',
      certificateNumber: item.certificateNumber || '',
      description: item.description || '',
      issueDate: dateInput(item.issueDate),
      expiryDate: dateInput(item.expiryDate),
      icon: item.icon || '',
      pdfUrl: item.pdfUrl || '',
      status: item.status || 'DRAFT',
      sortOrder: item.sortOrder ?? 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      issuer: form.issuer || null,
      certificateNumber: form.certificateNumber || null,
      issueDate: form.issueDate || null,
      expiryDate: form.expiryDate || null,
      icon: form.icon || null,
      pdfUrl: form.pdfUrl || null,
      sortOrder: Number(form.sortOrder) || 0
    };

    try {
      setIsSaving(true);
      let saved = editingId
        ? await updateAdminCertification(editingId, payload)
        : await createAdminCertification(payload);

      if (imageFile) saved = await uploadCertificationImage(saved.id, imageFile);

      setItems((current) => (editingId
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved]).sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)));
      showToast({ type: 'success', message: editingId ? 'Certification updated.' : 'Certification created.' });
      resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save certification.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveImage() {
    if (!currentItem?.icon || !editingId || !window.confirm('Remove this certification image?')) return;
    try {
      const updated = currentItem.iconPublicId
        ? await deleteCertificationImage(editingId)
        : await updateAdminCertification(editingId, { icon: null });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setForm((current) => ({ ...current, icon: '' }));
      showToast({ type: 'success', message: 'Certification image removed.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to remove image.' });
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete certification "${item.title}"?`)) return;
    try {
      await deleteAdminCertification(item.id);
      setItems((current) => current.filter((record) => record.id !== item.id));
      showToast({ type: 'success', message: 'Certification deleted.' });
      if (editingId === item.id) resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete certification.' });
    }
  }

  const columns = [
    {
      key: 'title',
      header: 'Certification',
      render: (item) => <div className="admin-certification-title">{item.icon ? <img src={item.icon} alt="" /> : <span><BadgeCheck size={20} /></span>}<div><strong>{item.title}</strong><small>{item.issuer || 'Issuer not set'}</small></div></div>
    },
    { key: 'certificateNumber', header: 'Number', render: (item) => item.certificateNumber || '-' },
    { key: 'validity', header: 'Validity', render: (item) => <span>{displayDate(item.issueDate)}<br />to {displayDate(item.expiryDate)}</span> },
    { key: 'sortOrder', header: 'Order' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'actions', header: 'Actions', render: (item) => <div className="admin-row-actions"><button type="button" onClick={() => handleEdit(item)} aria-label={`Edit ${item.title}`}><Edit3 size={16} /></button><button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button></div> }
  ];

  return (
    <main className="admin-content admin-certifications-page">
      <PageHeader eyebrow="Quality" title="Certifications" description="Publish only verified company certificates and supporting documents." actions={<button className="admin-btn" type="button" onClick={loadItems}><RefreshCw size={18} />Refresh</button>} />
      <section className="admin-editor-card" aria-label="Certification editor">
        <div className="admin-editor-card__header"><div><span>{editingId ? 'Edit certification' : 'New certification'}</span><h3>{editingId ? form.title : 'Add verified document'}</h3></div>{editingId && <button className="admin-icon-btn" type="button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
        <form className="admin-certification-form" onSubmit={handleSubmit}>
          <label>Title<input name="title" value={form.title} onChange={handleChange} required minLength={2} /></label>
          <label>Issuer<input name="issuer" value={form.issuer} onChange={handleChange} /></label>
          <label>Certificate number<input name="certificateNumber" value={form.certificateNumber} onChange={handleChange} /></label>
          <label>Issue date<input name="issueDate" type="date" value={form.issueDate} onChange={handleChange} /></label>
          <label>Expiry date<input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} min={form.issueDate || undefined} /></label>
          <label>Display order<input name="sortOrder" type="number" min="0" max="10000" value={form.sortOrder} onChange={handleChange} /></label>
          <label className="admin-certification-form__wide">Description<textarea name="description" value={form.description} onChange={handleChange} required minLength={5} rows={4} /></label>
          <label>Image URL<input name="icon" type="url" value={form.icon} onChange={handleChange} placeholder="https://..." /></label>
          <label>Certificate PDF URL<input name="pdfUrl" type="url" value={form.pdfUrl} onChange={handleChange} placeholder="https://...pdf" /></label>
          <label>Status<select name="status" value={form.status} onChange={handleChange}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
          <label className="admin-certification-upload"><span>Upload image</span><input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><small>{imageFile?.name || 'JPG, PNG, WebP, or SVG. Maximum 5 MB.'}</small></label>
          {(form.icon || currentItem?.icon) && <div className="admin-certification-preview"><img src={form.icon || currentItem?.icon} alt="Certification preview" /><button className="admin-btn" type="button" onClick={handleRemoveImage}>Remove image</button></div>}
          <div className="admin-certification-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><ImagePlus size={18} />{isSaving ? 'Saving...' : editingId ? 'Update Certification' : 'Create Certification'}</button>{editingId && <button className="admin-btn" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
      </section>
      <DataTable columns={columns} rows={filtered} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} emptyTitle="No certifications found" emptyDescription="Add a genuine company certificate, keep it in Draft, and activate it only after verification." />
    </main>
  );
}

export default AdminCertificationsPage;
