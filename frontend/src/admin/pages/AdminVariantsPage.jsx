import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminProducts } from '../../services/adminProductService.js';
import { createVariant, deleteVariant, fetchVariants, updateVariant } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

const emptyForm = {
  productId: '',
  name: '',
  sku: '',
  size: '',
  material: '',
  color: '',
  moq: '',
  specifications: '',
  status: 'ACTIVE',
  sortOrder: 0
};

function AdminVariantsPage() {
  const { showToast } = useToast();
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalVariants: 0 });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load(page = 1, term = search) {
    try {
      setIsLoading(true);
      const [variantData, productData] = await Promise.all([
        fetchVariants({ page, limit: 20, search: term || undefined }),
        products.length ? Promise.resolve({ products }) : fetchAdminProducts({ page: 1, limit: 100 })
      ]);
      setVariants(variantData.variants);
      setPagination(variantData.pagination);
      setProducts(productData.products || []);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load product variants.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editVariant(variant) {
    setEditingId(variant.id);
    setForm({
      productId: variant.productId || '',
      name: variant.name || '',
      sku: variant.sku || '',
      size: variant.size || '',
      material: variant.material || '',
      color: variant.color || '',
      moq: variant.moq || '',
      specifications: typeof variant.specifications === 'string'
        ? variant.specifications
        : JSON.stringify(variant.specifications || {}, null, 2),
      status: variant.status || 'ACTIVE',
      sortOrder: Number(variant.sortOrder || 0)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      let specifications = form.specifications;
      if (form.specifications.trim().startsWith('{') || form.specifications.trim().startsWith('[')) {
        try { specifications = JSON.parse(form.specifications); }
        catch { throw new Error('Specifications must contain valid JSON.'); }
      }
      const payload = { ...form, specifications, sortOrder: Number(form.sortOrder || 0) };
      if (editingId) await updateVariant(editingId, payload);
      else await createVariant(payload);
      showToast({ type: 'success', message: editingId ? 'Variant updated.' : 'Variant created.' });
      resetForm();
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save variant.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeVariant(variant) {
    if (!window.confirm(`Archive ${variant.name}?`)) return;
    try {
      await deleteVariant(variant.id);
      showToast({ type: 'success', message: 'Variant archived.' });
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to archive variant.' });
    }
  }

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Variant',
      render: (variant) => <div className="admin-ops-primary-cell"><strong>{variant.name}</strong><span>{variant.sku || 'No SKU'}</span></div>
    },
    { key: 'product', header: 'Product', render: (variant) => variant.product?.name || '-' },
    { key: 'size', header: 'Size / Material', render: (variant) => [variant.size, variant.material].filter(Boolean).join(' / ') || '-' },
    { key: 'moq', header: 'MOQ', render: (variant) => variant.moq || '-' },
    { key: 'status', header: 'Status', render: (variant) => <StatusBadge status={variant.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (variant) => <div className="admin-row-actions">
        <button type="button" onClick={() => editVariant(variant)} aria-label={`Edit ${variant.name}`}><Edit3 size={16} /></button>
        <button type="button" onClick={() => removeVariant(variant)} aria-label={`Archive ${variant.name}`}><Trash2 size={16} /></button>
      </div>
    }
  ], [pagination.currentPage]);

  return <main className="admin-content admin-ops-page">
    <PageHeader
      eyebrow="Catalog"
      title="Product Variants"
      description="Manage product sizes, materials, colors, SKUs, MOQ, and availability."
      actions={<button className="admin-btn" type="button" onClick={() => load(pagination.currentPage)}><RefreshCw size={17} />Refresh</button>}
    />

    <section className="admin-ops-editor" aria-label="Variant editor">
      <div className="admin-ops-editor__head"><div><span>{editingId ? 'Edit variant' : 'New variant'}</span><h3>{editingId ? form.name : 'Add product variant'}</h3></div>{editingId && <button className="admin-btn" type="button" onClick={resetForm}><X size={16} />Cancel</button>}</div>
      <form className="admin-ops-form" onSubmit={save}>
        <label>Product<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
        <label>Variant name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>
        <label>SKU<input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></label>
        <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>ACTIVE</option><option>INACTIVE</option><option>DRAFT</option></select></label>
        <label>Size<input value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></label>
        <label>Material<input value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} /></label>
        <label>Color<input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
        <label>MOQ<input value={form.moq} onChange={(event) => setForm({ ...form, moq: event.target.value })} /></label>
        <label className="admin-ops-form__wide">Specifications<textarea value={form.specifications} onChange={(event) => setForm({ ...form, specifications: event.target.value })} /></label>
        <label>Sort order<input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></label>
        <div className="admin-ops-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Plus size={17} />{isSaving ? 'Saving...' : editingId ? 'Update Variant' : 'Create Variant'}</button></div>
      </form>
    </section>

    <DataTable columns={columns} rows={variants} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} pagination={pagination} onPageChange={(page) => load(page)} emptyTitle="No variants found" emptyDescription="Create a size or material variant for an existing product." />
  </main>;
}

export default AdminVariantsPage;
