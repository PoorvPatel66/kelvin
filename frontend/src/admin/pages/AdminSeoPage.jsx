import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, ExternalLink, RefreshCw, Save, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchSeoRecords, fetchSeoSummary, updateSeoRecord } from '../../services/adminSeoService.js';
import './AdminSeoPage.css';

const recordTypes = [
  { value: 'PAGE', label: 'Pages' },
  { value: 'PRODUCT', label: 'Products' },
  { value: 'BLOG', label: 'Blogs' }
];

const emptyForm = {
  slug: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  metaRobots: 'index,follow',
  ogImage: ''
};

function getPreviewPath(record) {
  if (record.type === 'PRODUCT') return `/products/${record.slug}`;
  if (record.type === 'BLOG') return `/blog/${record.slug}`;
  if (record.pageKey === 'home' || record.slug === 'home') return '/';
  return `/${record.slug}`;
}

function AdminSeoPage() {
  const { showToast } = useToast();
  const [type, setType] = useState('PAGE');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totals, setTotals] = useState({ total: 0, optimized: 0, missing: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSeoSummary();
      setSummary(data.summary);
      setTotals(data.totals);
    } catch {
      showToast({ type: 'error', message: 'Unable to load SEO summary.' });
    }
  }, [showToast]);

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSeoRecords({ type, page, limit: 10, search: search.trim() || undefined });
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load SEO records.' });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, showToast, type]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = window.setTimeout(loadRecords, 250);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  function selectType(nextType) {
    setType(nextType);
    setPage(1);
    setEditing(null);
    setForm(emptyForm);
  }

  function startEditing(record) {
    setEditing(record);
    setForm({
      slug: record.slug || '',
      seoTitle: record.seoTitle || '',
      seoDescription: record.seoDescription || '',
      seoKeywords: (record.seoKeywords || []).join(', '),
      canonicalUrl: record.canonicalUrl || '',
      metaRobots: record.metaRobots || 'index,follow',
      ogImage: record.ogImage || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeEditor() {
    setEditing(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!editing) return;

    try {
      setIsSaving(true);
      const saved = await updateSeoRecord(editing.type, editing.id, {
        ...form,
        seoKeywords: form.seoKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      });
      setRecords((current) => current.map((record) => record.id === saved.id ? saved : record));
      showToast({ type: 'success', message: `${editing.title} SEO metadata updated.` });
      closeEditor();
      await loadSummary();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to update SEO metadata.' });
    } finally {
      setIsSaving(false);
    }
  }

  const columns = useMemo(() => [
    {
      key: 'title',
      header: 'Record',
      render: (record) => (
        <div className="admin-seo-record">
          <strong>{record.title}</strong>
          <span>/{record.slug}</span>
        </div>
      )
    },
    { key: 'status', header: 'Status', render: (record) => <StatusBadge status={record.status} /> },
    {
      key: 'optimized',
      header: 'SEO health',
      render: (record) => (
        <span className={`admin-seo-health ${record.optimized ? 'admin-seo-health--ready' : ''}`}>
          {record.optimized && <CheckCircle2 size={15} aria-hidden="true" />}
          {record.optimized ? 'Ready' : 'Needs metadata'}
        </span>
      )
    },
    {
      key: 'seoTitle',
      header: 'Search title',
      render: (record) => <span className="admin-seo-table-copy">{record.seoTitle || 'Not set'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (record) => (
        <div className="admin-row-actions">
          <button type="button" onClick={() => startEditing(record)} aria-label={`Edit SEO for ${record.title}`}>
            <Edit3 size={16} />
          </button>
          <a href={getPreviewPath(record)} target="_blank" rel="noreferrer" aria-label={`Preview ${record.title}`}>
            <ExternalLink size={16} />
          </a>
        </div>
      )
    }
  ], []);

  return (
    <main className="admin-content admin-seo-page">
      <PageHeader
        eyebrow="Website"
        title="SEO Manager"
        description="Manage search titles, descriptions, canonical URLs, robots directives, and social images for real website content."
        actions={(
          <button className="admin-btn" type="button" onClick={() => { loadRecords(); loadSummary(); }}>
            <RefreshCw size={18} /> Refresh
          </button>
        )}
      />

      <section className="admin-seo-summary" aria-label="SEO summary">
        <article><span>Managed records</span><strong>{totals.total}</strong></article>
        <article><span>SEO ready</span><strong>{totals.optimized}</strong></article>
        <article><span>Needs metadata</span><strong>{totals.missing}</strong></article>
        {summary.map((item) => (
          <article key={item.type}><span>{item.type.toLowerCase()} coverage</span><strong>{item.optimized}/{item.total}</strong></article>
        ))}
      </section>

      {editing && (
        <section className="admin-editor-card admin-seo-editor" aria-label={`Edit SEO for ${editing.title}`}>
          <div className="admin-editor-card__header">
            <div><span>{editing.type.toLowerCase()} metadata</span><h3>{editing.title}</h3></div>
            <button className="admin-icon-btn" type="button" onClick={closeEditor} aria-label="Close SEO editor"><X size={18} /></button>
          </div>
          <form className="admin-seo-form" onSubmit={handleSubmit}>
            <label>Slug<input name="slug" value={form.slug} onChange={handleChange} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label>
            <label>Robots directive<select name="metaRobots" value={form.metaRobots} onChange={handleChange}><option value="index,follow">index, follow</option><option value="index,nofollow">index, nofollow</option><option value="noindex,follow">noindex, follow</option><option value="noindex,nofollow">noindex, nofollow</option></select></label>
            <label className="admin-seo-form__wide">Search title <span>{form.seoTitle.length}/70</span><input name="seoTitle" value={form.seoTitle} onChange={handleChange} maxLength="70" placeholder={editing.title} /></label>
            <label className="admin-seo-form__wide">Meta description <span>{form.seoDescription.length}/170</span><textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} maxLength="170" rows="3" /></label>
            <label className="admin-seo-form__wide">Keywords <small>Separate keywords with commas.</small><input name="seoKeywords" value={form.seoKeywords} onChange={handleChange} /></label>
            <label>Canonical URL<input name="canonicalUrl" type="url" value={form.canonicalUrl} onChange={handleChange} placeholder="https://kelvinecoproducts.in/..." /></label>
            <label>Open Graph image URL<input name="ogImage" type="url" value={form.ogImage} onChange={handleChange} placeholder="https://..." /></label>
            <div className="admin-seo-form__actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Save size={18} />{isSaving ? 'Saving...' : 'Save SEO'}</button>
              <button className="admin-btn" type="button" onClick={closeEditor}>Cancel</button>
              <a className="admin-btn" href={getPreviewPath(editing)} target="_blank" rel="noreferrer"><ExternalLink size={18} />Preview</a>
            </div>
          </form>
        </section>
      )}

      <div className="admin-seo-tabs" role="tablist" aria-label="SEO record type">
        {recordTypes.map((item) => (
          <button key={item.value} type="button" role="tab" aria-selected={type === item.value} className={type === item.value ? 'is-active' : ''} onClick={() => selectType(item.value)}>{item.label}</button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={records}
        searchValue={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle={`No ${type.toLowerCase()} records found`}
        emptyDescription="Create or publish content in its primary admin module before optimizing it here."
      />
    </main>
  );
}

export default AdminSeoPage;
