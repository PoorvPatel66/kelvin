import { useEffect, useMemo, useState } from 'react';
import { Edit3, MessageSquareQuote, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminTestimonial,
  deleteAdminTestimonial,
  fetchAdminTestimonials,
  updateAdminTestimonial
} from '../../services/testimonialService.js';
import './AdminTestimonialsPage.css';

const emptyForm = {
  name: '', role: '', company: '', quote: '', sourceUrl: '', avatarUrl: '',
  rating: '', sortOrder: 0, featured: true, status: 'ACTIVE'
};

function AdminTestimonialsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadItems() {
    try {
      setIsLoading(true);
      setItems(await fetchAdminTestimonials());
    } catch {
      showToast({ type: 'error', message: 'Unable to load testimonials.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => [item.name, item.role, item.company, item.quote]
      .filter(Boolean).some((value) => value.toLowerCase().includes(term)));
  }, [items, search]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || '', role: item.role || '', company: item.company || '', quote: item.quote || '',
      sourceUrl: item.sourceUrl || '', avatarUrl: item.avatarUrl || '', rating: item.rating || '',
      sortOrder: item.sortOrder ?? 0, featured: Boolean(item.featured), status: item.status || 'ACTIVE'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      role: form.role || null,
      company: form.company || null,
      sourceUrl: form.sourceUrl || null,
      avatarUrl: form.avatarUrl || null,
      rating: form.rating ? Number(form.rating) : null,
      sortOrder: Number(form.sortOrder) || 0
    };
    try {
      setIsSaving(true);
      const saved = editingId
        ? await updateAdminTestimonial(editingId, payload)
        : await createAdminTestimonial(payload);
      setItems((current) => editingId
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved].sort((a, b) => a.sortOrder - b.sortOrder));
      showToast({ type: 'success', message: editingId ? 'Testimonial updated.' : 'Testimonial created.' });
      resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save testimonial.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete testimonial from "${item.name}"?`)) return;
    try {
      await deleteAdminTestimonial(item.id);
      setItems((current) => current.filter((record) => record.id !== item.id));
      showToast({ type: 'success', message: 'Testimonial deleted.' });
      if (editingId === item.id) resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete testimonial.' });
    }
  }

  const columns = useMemo(() => [
    { key: 'name', header: 'Client', render: (item) => <div className="admin-testimonial-client"><strong>{item.name}</strong><span>{[item.role, item.company].filter(Boolean).join(' | ') || '-'}</span></div> },
    { key: 'quote', header: 'Review', render: (item) => <span className="admin-testimonial-quote">{item.quote}</span> },
    { key: 'sortOrder', header: 'Order' },
    { key: 'featured', header: 'Featured', render: (item) => item.featured ? 'Yes' : 'No' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'actions', header: 'Actions', render: (item) => <div className="admin-row-actions"><button type="button" onClick={() => handleEdit(item)} aria-label={`Edit ${item.name}`}><Edit3 size={16} /></button><button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button></div> }
  ], [editingId]);

  return (
    <main className="admin-content admin-testimonials-page">
      <PageHeader eyebrow="Content" title="Testimonials" description="Control the client reviews displayed on the public homepage." actions={<button className="admin-btn" type="button" onClick={loadItems}><RefreshCw size={18} />Refresh</button>} />
      <section className="admin-editor-card" aria-label="Testimonial editor">
        <div className="admin-editor-card__header"><div><span>{editingId ? 'Edit review' : 'New review'}</span><h3>{editingId ? form.name : 'Add client testimonial'}</h3></div>{editingId && <button className="admin-icon-btn" type="button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
        <form className="admin-testimonial-form" onSubmit={handleSubmit}>
          <label>Client name<input name="name" value={form.name} onChange={handleChange} required minLength={2} /></label>
          <label>Role<input name="role" value={form.role} onChange={handleChange} placeholder="Importer, UAE" /></label>
          <label>Company<input name="company" value={form.company} onChange={handleChange} /></label>
          <label className="admin-testimonial-form__wide">Review<textarea name="quote" value={form.quote} onChange={handleChange} required minLength={10} rows={4} /></label>
          <label>Source URL<input name="sourceUrl" type="url" value={form.sourceUrl} onChange={handleChange} placeholder="https://..." /></label>
          <label>Avatar URL<input name="avatarUrl" type="url" value={form.avatarUrl} onChange={handleChange} placeholder="https://..." /></label>
          <label>Rating<select name="rating" value={form.rating} onChange={handleChange}><option value="">Not shown</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
          <label>Display order<input name="sortOrder" type="number" min="0" value={form.sortOrder} onChange={handleChange} /></label>
          <label>Status<select name="status" value={form.status} onChange={handleChange}><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="INACTIVE">Inactive</option></select></label>
          <label className="admin-testimonial-check"><input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />Featured on homepage</label>
          <div className="admin-testimonial-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><MessageSquareQuote size={18} />{isSaving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}</button>{editingId && <button className="admin-btn" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
      </section>
      <DataTable columns={columns} rows={filtered} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} emptyTitle="No testimonials found" emptyDescription="Add a verified client review for the homepage." />
    </main>
  );
}

export default AdminTestimonialsPage;
