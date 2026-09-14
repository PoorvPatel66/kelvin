import { useEffect, useMemo, useState } from 'react';
import { Edit3, Eye, Plus, RefreshCw, RotateCcw, Star, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminBlog,
  createAdminBlogCategory,
  deleteAdminBlog,
  draftAdminBlog,
  fetchAdminBlogCategories,
  fetchAdminBlogs,
  permanentlyDeleteAdminBlog,
  publishAdminBlog,
  restoreAdminBlog,
  setAdminBlogFeatured,
  updateAdminBlog
} from '../../services/adminBlogService.js';
import './AdminBlogsPage.css';

const emptyBlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'DRAFT',
  featured: false,
  categoryId: '',
  tags: '',
  seoTitle: '',
  seoDescription: '',
  scheduledAt: ''
};

const emptyCategoryForm = {
  name: '',
  slug: '',
  description: '',
  status: 'PUBLISHED'
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildBlogPayload(formData) {
  return {
    title: formData.title,
    slug: slugify(formData.slug || formData.title),
    excerpt: formData.excerpt,
    content: formData.content,
    contentFormat: 'MARKDOWN',
    status: formData.status,
    featured: formData.featured,
    ...(formData.scheduledAt ? { scheduledAt: formData.scheduledAt } : {}),
    ...(formData.categoryId ? { categoryId: formData.categoryId } : {}),
    ...(formData.tags ? { tags: formData.tags } : {}),
    ...(formData.seoTitle ? { seoTitle: formData.seoTitle } : {}),
    ...(formData.seoDescription ? { seoDescription: formData.seoDescription } : {})
  };
}

function AdminBlogsPage() {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState('active');

  async function loadBlogs(nextPage = page, nextSearch = search) {
    try {
      setIsLoading(true);
      const [blogData, categoryData] = await Promise.all([
        fetchAdminBlogs({
          page: nextPage,
          limit: 10,
          search: nextSearch || undefined,
          trash: view === 'trash' || undefined
        }),
        fetchAdminBlogCategories()
      ]);

      setBlogs(blogData.blogs);
      setPagination(blogData.pagination);
      setCategories(categoryData);
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to load blogs.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs(page, search);
  }, [page, search, view]);

  function resetBlogForm() {
    setEditingId(null);
    setBlogForm(emptyBlogForm);
  }

  function handleBlogChange(event) {
    const { name, type, checked, value } = event.target;

    setBlogForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !editingId ? { slug: slugify(value) } : {})
    }));
  }

  function handleCategoryChange(event) {
    const { name, value } = event.target;
    setCategoryForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'name' ? { slug: slugify(value) } : {})
    }));
  }

  function handleEdit(blog) {
    setEditingId(blog.id);
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      status: blog.status || 'DRAFT',
      featured: Boolean(blog.featured),
      categoryId: blog.categoryId || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSaveBlog(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      const payload = buildBlogPayload(blogForm);
      const savedBlog = editingId ? await updateAdminBlog(editingId, payload) : await createAdminBlog(payload);

      setBlogs((current) => {
        if (editingId) {
          return current.map((blog) => (blog.id === savedBlog.id ? savedBlog : blog));
        }

        return [savedBlog, ...current];
      });

      showToast({ type: 'success', message: editingId ? 'Blog updated.' : 'Blog created.' });
      resetBlogForm();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to save blog.'
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(event) {
    event.preventDefault();

    try {
      const category = await createAdminBlogCategory({
        ...categoryForm,
        slug: slugify(categoryForm.slug || categoryForm.name)
      });
      setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryForm(emptyCategoryForm);
      showToast({ type: 'success', message: 'Blog category created.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to create blog category.'
      });
    }
  }

  async function handleDelete(blog) {
    const confirmed = window.confirm(`Delete "${blog.title}"?`);
    if (!confirmed) return;

    try {
      await deleteAdminBlog(blog.id);
      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      showToast({ type: 'success', message: 'Blog deleted.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete blog.'
      });
    }
  }

  async function handleRestore(blog) {
    try {
      await restoreAdminBlog(blog.id);
      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      showToast({ type: 'success', message: 'Blog restored.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to restore blog.'
      });
    }
  }

  async function handlePermanentDelete(blog) {
    const confirmed = window.confirm(`Permanently delete "${blog.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await permanentlyDeleteAdminBlog(blog.id);
      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      showToast({ type: 'success', message: 'Blog permanently deleted.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to permanently delete blog.'
      });
    }
  }

  async function handlePublishToggle(blog) {
    try {
      const updatedBlog = blog.status === 'PUBLISHED' ? await draftAdminBlog(blog.id) : await publishAdminBlog(blog.id);
      setBlogs((current) => current.map((item) => (item.id === blog.id ? updatedBlog : item)));
      showToast({ type: 'success', message: blog.status === 'PUBLISHED' ? 'Blog moved to draft.' : 'Blog published.' });
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to update blog status.' });
    }
  }

  async function handleFeaturedToggle(blog) {
    try {
      const updatedBlog = await setAdminBlogFeatured(blog.id, !blog.featured);
      setBlogs((current) => current.map((item) => (item.id === blog.id ? updatedBlog : item)));
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to update featured state.' });
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Article',
        render: (blog) => (
          <div className="admin-blog-cell">
            <strong>{blog.title}</strong>
            <span>{blog.slug}</span>
          </div>
        )
      },
      {
        key: 'category',
        header: 'Category',
        render: (blog) => blog.category?.name || 'Unassigned'
      },
      {
        key: 'status',
        header: 'Status',
        render: (blog) => <StatusBadge status={blog.status} />
      },
      {
        key: 'featured',
        header: 'Featured',
        render: (blog) => (blog.featured ? 'Yes' : 'No')
      },
      {
        key: 'schedule',
        header: 'Schedule',
        render: (blog) => (blog.scheduledAt ? new Date(blog.scheduledAt).toLocaleString() : '-')
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        render: (blog) => (blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : '-')
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (blog) => (
          <div className="admin-row-actions admin-blog-actions">
            {view === 'trash' ? (
              <>
                <button type="button" onClick={() => handleRestore(blog)} aria-label={`Restore ${blog.title}`}>
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => handlePermanentDelete(blog)} aria-label={`Permanently delete ${blog.title}`}>
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to={`/blog/${blog.slug}`} target="_blank" aria-label={`Preview ${blog.title}`}>
                  <Eye size={16} />
                </Link>
                <button type="button" onClick={() => handleFeaturedToggle(blog)} aria-label={`Toggle featured ${blog.title}`}>
                  <Star size={16} fill={blog.featured ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={() => handlePublishToggle(blog)}>
                  {blog.status === 'PUBLISHED' ? 'Draft' : 'Publish'}
                </button>
                <button type="button" onClick={() => handleEdit(blog)} aria-label={`Edit ${blog.title}`}>
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(blog)} aria-label={`Delete ${blog.title}`}>
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
    <main className="admin-content admin-blogs-page">
      <PageHeader
        eyebrow="Content"
        title="Blogs"
        description="Create, edit, publish, feature, and delete blog articles used by the public Blog page."
        actions={
          <div className="admin-blog-view-actions">
            <button className={`admin-btn ${view === 'active' ? 'admin-btn--primary' : ''}`} type="button" onClick={() => setView('active')}>
              Active
            </button>
            <button className={`admin-btn ${view === 'trash' ? 'admin-btn--primary' : ''}`} type="button" onClick={() => setView('trash')}>
              Trash
            </button>
            <button className="admin-btn" type="button" onClick={() => loadBlogs(page, search)}>
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
          </div>
        }
      />

      {view === 'active' && <section className="admin-blog-editor-grid">
        <form className="admin-editor-card admin-blog-form" onSubmit={handleSaveBlog}>
          <div className="admin-editor-card__header">
            <div>
              <span>{editingId ? 'Edit article' : 'New article'}</span>
              <h3>{editingId ? blogForm.title : 'Write blog article'}</h3>
            </div>
            {editingId && (
              <button className="admin-icon-btn" type="button" onClick={resetBlogForm} aria-label="Cancel editing">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="admin-blog-form__grid">
            <label>
              Title
              <input name="title" value={blogForm.title} onChange={handleBlogChange} required minLength={3} />
            </label>
            <label>
              Slug
              <input name="slug" value={blogForm.slug} onChange={handleBlogChange} required />
            </label>
            <label>
              Category
              <select name="categoryId" value={blogForm.categoryId} onChange={handleBlogChange}>
                <option value="">Unassigned</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" value={blogForm.status} onChange={handleBlogChange}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label>
              Scheduled publish
              <input
                name="scheduledAt"
                type="datetime-local"
                value={blogForm.scheduledAt}
                onChange={handleBlogChange}
                disabled={blogForm.status !== 'SCHEDULED'}
              />
            </label>
            <label className="admin-blog-form__wide">
              Excerpt
              <textarea name="excerpt" value={blogForm.excerpt} onChange={handleBlogChange} rows={3} required />
            </label>
            <label className="admin-blog-form__wide">
              Content
              <textarea name="content" value={blogForm.content} onChange={handleBlogChange} rows={8} required />
            </label>
            <label>
              Tags
              <input name="tags" value={blogForm.tags} onChange={handleBlogChange} placeholder="paper cups, export" />
            </label>
            <label>
              SEO title
              <input name="seoTitle" value={blogForm.seoTitle} onChange={handleBlogChange} maxLength={70} />
            </label>
            <label className="admin-blog-form__wide">
              SEO description
              <textarea
                name="seoDescription"
                value={blogForm.seoDescription}
                onChange={handleBlogChange}
                rows={2}
                maxLength={170}
              />
            </label>
            <label className="admin-blog-form__check">
              <input name="featured" type="checkbox" checked={blogForm.featured} onChange={handleBlogChange} />
              Featured article
            </label>
          </div>

          <div className="admin-category-form__actions">
            <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
              <Plus size={18} aria-hidden="true" />
              {isSaving ? 'Saving...' : editingId ? 'Update Blog' : 'Create Blog'}
            </button>
            {editingId && (
              <button className="admin-btn" type="button" onClick={resetBlogForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <form className="admin-editor-card admin-blog-category-form" onSubmit={handleCreateCategory}>
          <div className="admin-editor-card__header">
            <div>
              <span>Blog taxonomy</span>
              <h3>Categories</h3>
            </div>
          </div>
          <label>
            Name
            <input name="name" value={categoryForm.name} onChange={handleCategoryChange} required />
          </label>
          <label>
            Slug
            <input name="slug" value={categoryForm.slug} onChange={handleCategoryChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={categoryForm.description} onChange={handleCategoryChange} rows={3} />
          </label>
          <button className="admin-btn admin-btn--primary" type="submit">
            Add Category
          </button>
          <div className="admin-blog-category-list">
            {categories.map((category) => (
              <span key={category.id}>
                {category.name}
                <small>{category._count?.blogs || 0}</small>
              </span>
            ))}
          </div>
        </form>
      </section>}

      <DataTable
        columns={columns}
        rows={blogs}
        searchValue={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No blog articles found"
        emptyDescription="Create a blog post to publish content on the public website."
      />
    </main>
  );
}

export default AdminBlogsPage;
