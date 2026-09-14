import { useEffect, useMemo, useState } from 'react';
import { Edit3, ExternalLink, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createCatalog, deleteCatalog, fetchCatalogs, updateCatalog } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

const emptyForm = { title: '', slug: '', description: '', fileUrl: '', thumbnailUrl: '', version: '', status: 'DRAFT', featured: false, sortOrder: 0 };

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function AdminCatalogsPage() {
  const { showToast } = useToast();
  const [catalogs, setCatalogs] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load(term = search) {
    try {
      setIsLoading(true);
      const data = await fetchCatalogs({ search: term || undefined });
      setCatalogs(data.catalogs);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load catalogs.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() { setEditingId(null); setForm(emptyForm); }

  function editCatalog(catalog) {
    setEditingId(catalog.id);
    setForm({
      title: catalog.title || '', slug: catalog.slug || '', description: catalog.description || '', fileUrl: catalog.fileUrl || '',
      thumbnailUrl: catalog.thumbnailUrl || '', version: catalog.version || '', status: catalog.status || 'DRAFT',
      featured: Boolean(catalog.featured), sortOrder: Number(catalog.sortOrder || 0)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const payload = { ...form, slug: slugify(form.slug || form.title), sortOrder: Number(form.sortOrder || 0) };
      if (editingId) await updateCatalog(editingId, payload);
      else await createCatalog(payload);
      showToast({ type: 'success', message: editingId ? 'Catalog updated.' : 'Catalog created.' });
      resetForm();
      await load();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save catalog.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCatalog(catalog) {
    if (!window.confirm(`Archive ${catalog.title}?`)) return;
    try { await deleteCatalog(catalog.id); showToast({ type: 'success', message: 'Catalog archived.' }); await load(); }
    catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to archive catalog.' }); }
  }

  const columns = useMemo(() => [
    { key: 'title', header: 'Catalog', render: (catalog) => <div className="admin-ops-primary-cell"><strong>{catalog.title}</strong><span>{catalog.version || catalog.slug}</span></div> },
    { key: 'featured', header: 'Featured', render: (catalog) => catalog.featured ? 'Yes' : 'No' },
    { key: 'status', header: 'Status', render: (catalog) => <StatusBadge status={catalog.status} /> },
    { key: 'updatedAt', header: 'Updated', render: (catalog) => new Date(catalog.updatedAt).toLocaleDateString() },
    { key: 'actions', header: 'Actions', render: (catalog) => <div className="admin-row-actions">{catalog.fileUrl && <a href={catalog.fileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${catalog.title}`}><ExternalLink size={16} /></a>}<button type="button" onClick={() => editCatalog(catalog)} aria-label={`Edit ${catalog.title}`}><Edit3 size={16} /></button><button type="button" onClick={() => removeCatalog(catalog)} aria-label={`Archive ${catalog.title}`}><Trash2 size={16} /></button></div> }
  ], []);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Catalog" title="Downloads & Catalogs" description="Publish downloadable catalogs and control which version appears on the public website." actions={<button className="admin-btn" type="button" onClick={() => load()}><RefreshCw size={17} />Refresh</button>} />
    <section className="admin-ops-editor" aria-label="Catalog editor">
      <div className="admin-ops-editor__head"><div><span>{editingId ? 'Edit catalog' : 'New catalog'}</span><h3>{editingId ? form.title : 'Add downloadable catalog'}</h3></div>{editingId && <button className="admin-btn" type="button" onClick={resetForm}><X size={16} />Cancel</button>}</div>
      <form className="admin-ops-form" onSubmit={save}>
        <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, ...(!editingId ? { slug: slugify(event.target.value) } : {}) })} required minLength={2} /></label>
        <label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required /></label>
        <label>Version<input value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} placeholder="2026.1" /></label>
        <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label>
        <label className="admin-ops-form__wide">File URL<input type="url" value={form.fileUrl} onChange={(event) => setForm({ ...form, fileUrl: event.target.value })} required placeholder="https://.../catalog.pdf" /></label>
        <label className="admin-ops-form__wide">Thumbnail URL<input type="url" value={form.thumbnailUrl} onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })} placeholder="https://.../cover.webp" /></label>
        <label className="admin-ops-form__wide">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label>Sort order<input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></label>
        <label><span>Featured</span><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /></label>
        <div className="admin-ops-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Plus size={17} />{isSaving ? 'Saving...' : editingId ? 'Update Catalog' : 'Create Catalog'}</button></div>
      </form>
    </section>
    <DataTable columns={columns} rows={catalogs} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} emptyTitle="No catalogs found" emptyDescription="Add a downloadable catalog and publish it for the public website." />
  </main>;
}

export default AdminCatalogsPage;
