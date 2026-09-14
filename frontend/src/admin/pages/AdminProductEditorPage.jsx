import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct
} from '../../services/adminProductService.js';
import './AdminProductEditorPage.css';

const initialForm = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  material: '',
  sizes: '',
  capacity: '',
  moq: '',
  usage: '',
  specifications: '{}',
  status: 'ACTIVE',
  featured: false,
  categoryId: ''
};

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function AdminProductEditorPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchAdminCategories({ limit: 100 });
        setCategories(data);
      } catch (error) {
        showToast({ type: 'error', message: 'Unable to load categories.' });
      }
    }

    loadCategories();
  }, [showToast]);

  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    async function loadProductForEdit() {
      try {
        const data = await fetchAdminProducts({ limit: 100 });
        const product = data.products.find((item) => item.id === id);

        if (!product) {
          throw new Error('Product not found in admin product list.');
        }

        if (isMounted) {
          setForm({
            name: product.name || '',
            slug: product.slug || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            material: product.material || '',
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
            capacity: product.capacity || '',
            moq: product.moq || '',
            usage: product.usage || '',
            specifications: JSON.stringify(product.specifications || {}, null, 2),
            status: product.status || 'ACTIVE',
            featured: Boolean(product.featured),
            categoryId: product.categoryId || ''
          });
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Unable to load this product for editing.' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProductForEdit();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, showToast]);

  const selectedCategoryName = useMemo(() => {
    return categories.find((category) => category.id === form.categoryId)?.name || 'Select a category';
  }, [categories, form.categoryId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value };

      if (name === 'name' && !current.slug) {
        next.slug = toSlug(value);
      }

      return next;
    });
  }

  function buildPayload() {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });

    files.forEach((file) => {
      payload.append('images', file);
    });

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.slug || !form.categoryId || !form.description || !form.moq) {
      showToast({ type: 'error', message: 'Name, slug, category, description, and MOQ are required.' });
      return;
    }

    try {
      JSON.parse(form.specifications || '{}');
    } catch (error) {
      showToast({ type: 'error', message: 'Specifications must be valid JSON.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload();

      if (isEditMode) {
        await updateAdminProduct(id, payload);
        showToast({ type: 'success', message: 'Product updated.' });
      } else {
        await createAdminProduct(payload);
        showToast({ type: 'success', message: 'Product created.' });
      }

      navigate('/admin/products');
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save product.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-content">
      <PageHeader
        eyebrow="Catalog"
        title={isEditMode ? 'Edit Product' : 'New Product'}
        description="Create and maintain product information used by the public catalog and backend APIs."
        actions={
          <Link className="admin-btn" to="/admin/products">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Products
          </Link>
        }
      />

      <form className="admin-editor" onSubmit={handleSubmit}>
        {isLoading ? (
          <div className="admin-editor__loading">Loading product...</div>
        ) : (
          <>
            <section className="admin-editor__panel admin-editor__panel--main">
              <div className="admin-form-grid">
                <label>
                  Product Name
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Paper Cups" />
                </label>
                <label>
                  Slug
                  <input name="slug" value={form.slug} onChange={handleChange} placeholder="paper-cups" />
                </label>
                <label>
                  Category
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                    <option value="">{selectedCategoryName}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  MOQ
                  <input name="moq" value={form.moq} onChange={handleChange} placeholder="Bulk order support" />
                </label>
                <label className="admin-form-grid__wide">
                  Short Description
                  <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows="3" />
                </label>
                <label className="admin-form-grid__wide">
                  Description
                  <textarea name="description" value={form.description} onChange={handleChange} rows="5" />
                </label>
                <label>
                  Material
                  <input name="material" value={form.material} onChange={handleChange} placeholder="Food-grade paper board" />
                </label>
                <label>
                  Sizes
                  <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="120ml, 150ml, 250ml" />
                </label>
                <label>
                  Capacity
                  <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="120ml to 600ml" />
                </label>
                <label>
                  Usage
                  <input name="usage" value={form.usage} onChange={handleChange} placeholder="Hot and cold beverages" />
                </label>
                <label className="admin-form-grid__wide">
                  Specifications JSON
                  <textarea name="specifications" value={form.specifications} onChange={handleChange} rows="6" />
                </label>
              </div>
            </section>

            <aside className="admin-editor__panel">
              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </label>
              <label className="admin-editor__check">
                <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />
                Featured product
              </label>
              <label>
                Product Images
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={(event) => setFiles(Array.from(event.target.files || []))}
                />
              </label>
              <p className="admin-editor__hint">Uploads are sent to the existing product image handling in the backend. Maximum limits are enforced server-side.</p>
              <button className="admin-btn admin-btn--primary admin-editor__submit" type="submit" disabled={isSubmitting}>
                <Save size={18} aria-hidden="true" />
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </aside>
          </>
        )}
      </form>
    </main>
  );
}

export default AdminProductEditorPage;
