import { useEffect, useMemo, useState } from 'react';
import { Edit3, FolderPlus, RefreshCw, RotateCcw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  permanentlyDeleteAdminCategory,
  restoreAdminCategory,
  updateAdminCategory
} from '../../services/adminCategoryService.js';
import './AdminCategoriesPage.css';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  status: 'ACTIVE',
  imageUrl: '',
  sortOrder: 0,
  parentId: ''
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState('active');

  async function loadCategories() {
    try {
      setIsLoading(true);
      const data = await fetchAdminCategories(view === 'trash' ? { trash: true } : {});
      setCategories(data);
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to load categories.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [view]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter((category) =>
      [category.name, category.slug, category.description, category.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [categories, search]);

  function resetForm() {
    setEditingId(null);
    setFormData(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' && !editingId ? { slug: slugify(value) } : {})
    }));
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      status: category.status || 'ACTIVE',
      imageUrl: category.imageUrl || '',
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId || ''
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...formData,
      slug: slugify(formData.slug || formData.name),
      sortOrder: Number(formData.sortOrder || 0),
      imageUrl: formData.imageUrl || null,
      parentId: formData.parentId || null
    };

    try {
      setIsSaving(true);
      const savedCategory = editingId
        ? await updateAdminCategory(editingId, payload)
        : await createAdminCategory(payload);

      setCategories((current) => {
        if (editingId) {
          return current.map((category) => (category.id === savedCategory.id ? savedCategory : category));
        }

        return [savedCategory, ...current];
      });

      showToast({
        type: 'success',
        message: editingId ? 'Category updated.' : 'Category created.'
      });
      resetForm();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to save category.'
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Delete "${category.name}"? Products must be moved first.`);
    if (!confirmed) return;

    try {
      await deleteAdminCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      showToast({ type: 'success', message: 'Category deleted.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete category.'
      });
    }
  }

  async function handleRestore(category) {
    try {
      await restoreAdminCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      showToast({ type: 'success', message: 'Category restored.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to restore category.' });
    }
  }

  async function handlePermanentDelete(category) {
    const confirmed = window.confirm(`Permanently delete "${category.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await permanentlyDeleteAdminCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      showToast({ type: 'success', message: 'Category permanently deleted.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to permanently delete category.' });
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Category',
        render: (category) => (
          <div className="admin-category-cell">
            <strong>{category.name}</strong>
            <span>{category.slug}</span>
          </div>
        )
      },
      {
        key: 'parent',
        header: 'Parent / order',
        render: (category) => (
          <div className="admin-category-cell">
            <strong>{category.parent?.name || 'Top level'}</strong>
            <span>Order {category.sortOrder || 0}</span>
          </div>
        )
      },
      {
        key: 'description',
        header: 'Description',
        render: (category) => category.description || '-'
      },
      {
        key: 'products',
        header: 'Products',
        render: (category) => category._count?.products || 0
      },
      {
        key: 'status',
        header: 'Status',
        render: (category) => <StatusBadge status={category.status} />
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (category) => (
          <div className="admin-row-actions">
            {view === 'trash' ? (
              <>
                <button type="button" onClick={() => handleRestore(category)} aria-label={`Restore ${category.name}`}>
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => handlePermanentDelete(category)} aria-label={`Permanently delete ${category.name}`}>
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => handleEdit(category)} aria-label={`Edit ${category.name}`}>
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(category)} aria-label={`Delete ${category.name}`}>
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )
      }
    ],
    [view]
  );

  return (
    <main className="admin-content admin-categories-page">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create, update, search, and remove product categories used by the public product catalog."
        actions={
          <div className="admin-category-view-actions">
            <button className={`admin-btn ${view === 'active' ? 'admin-btn--primary' : ''}`} type="button" onClick={() => setView('active')}>
              Active
            </button>
            <button className={`admin-btn ${view === 'trash' ? 'admin-btn--primary' : ''}`} type="button" onClick={() => setView('trash')}>
              Trash
            </button>
            <button className="admin-btn" type="button" onClick={loadCategories}>
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
          </div>
        }
      />

      {view === 'active' && <section className="admin-editor-card" aria-label="Category editor">
        <div className="admin-editor-card__header">
          <div>
            <span>{editingId ? 'Edit category' : 'New category'}</span>
            <h3>{editingId ? formData.name : 'Add product category'}</h3>
          </div>
          {editingId && (
            <button className="admin-icon-btn" type="button" onClick={resetForm} aria-label="Cancel editing">
              <X size={18} />
            </button>
          )}
        </div>

        <form className="admin-category-form" onSubmit={handleSubmit}>
          <label>
            Category name
            <input name="name" value={formData.name} onChange={handleChange} required minLength={2} />
          </label>
          <label>
            Slug
            <input name="slug" value={formData.slug} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <label>
            Parent category
            <select name="parentId" value={formData.parentId} onChange={handleChange}>
              <option value="">Top-level category</option>
              {categories
                .filter((category) => category.id !== editingId)
                .map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
          </label>
          <label>
            Display order
            <input name="sortOrder" type="number" min="0" max="10000" value={formData.sortOrder} onChange={handleChange} />
          </label>
          <label>
            Image URL
            <input name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
          </label>
          <label className="admin-category-form__wide">
            Description
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} />
          </label>
          <div className="admin-category-form__actions">
            <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
              <FolderPlus size={18} aria-hidden="true" />
              {isSaving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
            {editingId && (
              <button className="admin-btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>}

      <DataTable
        columns={columns}
        rows={filteredCategories}
        searchValue={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        emptyTitle="No categories found"
        emptyDescription="Create categories before assigning products."
      />
    </main>
  );
}

export default AdminCategoriesPage;
