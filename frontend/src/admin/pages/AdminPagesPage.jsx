import { useCallback, useEffect, useState } from 'react';
import { Edit3, Eye, FilePlus2, RefreshCw, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  PAGE_KEY_OPTIONS,
  PAGE_SECTION_SCHEMAS,
  PAGE_SECTION_TEMPLATES,
  getPagePreviewPath
} from '../config/pageSectionSchemas.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminPage,
  deleteAdminPage,
  draftAdminPage,
  fetchAdminPages,
  publishAdminPage,
  updateAdminPage
} from '../../services/adminPageService.js';
import './AdminPagesPage.css';

const emptyForm = {
  title: '',
  slug: '',
  pageKey: '',
  status: 'DRAFT',
  excerpt: '',
  content: '',
  sections: {},
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  ogImage: ''
};

function cloneSections(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function formatSectionsJson(value) {
  return JSON.stringify(value || {}, null, 2);
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildPagePayload(formData) {
  return {
    title: formData.title,
    slug: slugify(formData.slug || formData.title),
    pageKey: formData.pageKey || null,
    status: formData.status,
    excerpt: formData.excerpt || null,
    content: formData.content || null,
    sections: formData.sections,
    seoTitle: formData.seoTitle || null,
    seoDescription: formData.seoDescription || null,
    canonicalUrl: formData.canonicalUrl || null,
    ogImage: formData.ogImage || null
  };
}

function AdminPagesPage({ pageKey = '' }) {
  const { showToast } = useToast();
  const [pages, setPages] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [sectionsJson, setSectionsJson] = useState('{}');
  const [sectionsJsonError, setSectionsJsonError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm = pageKey ? { ...emptyForm, pageKey } : emptyForm;

  const loadPages = useCallback(async (nextPage, nextSearch) => {
    try {
      setIsLoading(true);
      const data = await fetchAdminPages({
        page: nextPage,
        limit: 10,
        search: nextSearch || undefined,
        pageKey: pageKey || undefined
      });

      setPages(data.pages);
      setPagination(data.pagination);
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to load website pages.' });
    } finally {
      setIsLoading(false);
    }
  }, [pageKey, showToast]);

  useEffect(() => {
    loadPages(page, search);
  }, [loadPages, page, search]);

  function resetForm() {
    setEditingId(null);
    setFormData(initialForm);
    setSectionsJson('{}');
    setSectionsJsonError('');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'title' && !editingId ? { slug: slugify(value) } : {})
    }));
  }

  function syncSections(nextSections) {
    setFormData((current) => ({ ...current, sections: nextSections }));
    setSectionsJson(formatSectionsJson(nextSections));
    setSectionsJsonError('');
  }

  function applySectionsTemplate(pageKey) {
    const template = cloneSections(PAGE_SECTION_TEMPLATES[pageKey]);
    syncSections(template);
  }

  function handleSectionChange(field, value) {
    setFormData((current) => {
      const currentSection = current.sections?.[field.section];
      const normalizedSection =
        currentSection && typeof currentSection === 'object' && !Array.isArray(currentSection)
          ? currentSection
          : typeof currentSection === 'string'
            ? { heading: currentSection }
            : {};

      const nextSections = {
        ...current,
        sections: {
          ...current.sections,
          [field.section]: { ...normalizedSection, [field.key]: value }
        }
      }.sections;

      setSectionsJson(formatSectionsJson(nextSections));
      setSectionsJsonError('');

      return {
        ...current,
        sections: nextSections
      };
    });
  }

  function handlePageKeyChange(event) {
    const value = event.target.value;

    setFormData((current) => {
      const hasSections = current.sections && Object.keys(current.sections).length > 0;
      const nextSections =
        !editingId && value && !hasSections && PAGE_SECTION_TEMPLATES[value]
          ? cloneSections(PAGE_SECTION_TEMPLATES[value])
          : current.sections;

      setSectionsJson(formatSectionsJson(nextSections));
      setSectionsJsonError('');

      return {
        ...current,
        pageKey: value,
        sections: nextSections
      };
    });
  }

  function handleSectionsJsonChange(event) {
    const nextValue = event.target.value;
    setSectionsJson(nextValue);

    try {
      const parsed = JSON.parse(nextValue || '{}');
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Sections JSON must be an object.');
      }

      setFormData((current) => ({
        ...current,
        sections: parsed
      }));
      setSectionsJsonError('');
    } catch (error) {
      setSectionsJsonError(error.message || 'Invalid JSON.');
    }
  }

  function handleEdit(pageRecord) {
    const nextSections =
      pageRecord.sections && typeof pageRecord.sections === 'object' ? pageRecord.sections : {};

    setEditingId(pageRecord.id);
    setFormData({
      title: pageRecord.title || '',
      slug: pageRecord.slug || '',
      pageKey: pageKey || pageRecord.pageKey || '',
      status: pageRecord.status || 'DRAFT',
      excerpt: pageRecord.excerpt || '',
      content: pageRecord.content || '',
      sections: nextSections,
      seoTitle: pageRecord.seoTitle || '',
      seoDescription: pageRecord.seoDescription || '',
      canonicalUrl: pageRecord.canonicalUrl || '',
      ogImage: pageRecord.ogImage || ''
    });
    setSectionsJson(formatSectionsJson(nextSections));
    setSectionsJsonError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (sectionsJsonError) {
      showToast({ type: 'error', message: 'Fix the sections JSON before saving this page.' });
      return;
    }

    const payload = buildPagePayload(formData);

    try {
      setIsSaving(true);
      const savedPage = editingId ? await updateAdminPage(editingId, payload) : await createAdminPage(payload);

      setPages((current) => {
        if (editingId) {
          return current.map((item) => (item.id === savedPage.id ? savedPage : item));
        }

        return [savedPage, ...current];
      });

      showToast({ type: 'success', message: editingId ? 'Website page updated.' : 'Website page created.' });
      resetForm();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to save website page.'
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishToggle(pageRecord) {
    try {
      const updatedPage =
        pageRecord.status === 'PUBLISHED' ? await draftAdminPage(pageRecord.id) : await publishAdminPage(pageRecord.id);
      setPages((current) => current.map((item) => (item.id === pageRecord.id ? updatedPage : item)));
      showToast({
        type: 'success',
        message: pageRecord.status === 'PUBLISHED' ? 'Page moved to draft.' : 'Page published.'
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to update page status.' });
    }
  }

  async function handleDelete(pageRecord) {
    const confirmed = window.confirm(`Delete "${pageRecord.title}"? This removes the CMS page record.`);
    if (!confirmed) return;

    try {
      await deleteAdminPage(pageRecord.id);
      setPages((current) => current.filter((item) => item.id !== pageRecord.id));
      showToast({ type: 'success', message: 'Website page deleted.' });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete website page.'
      });
    }
  }

  const columns = [
      {
        key: 'title',
        header: 'Page',
        render: (pageRecord) => (
          <div className="admin-page-cell">
            <strong>{pageRecord.title}</strong>
            <span>/{pageRecord.slug}</span>
          </div>
        )
      },
      {
        key: 'pageKey',
        header: 'Key',
        render: (pageRecord) => pageRecord.pageKey || '-'
      },
      {
        key: 'status',
        header: 'Status',
        render: (pageRecord) => <StatusBadge status={pageRecord.status} />
      },
      {
        key: 'seoTitle',
        header: 'SEO',
        render: (pageRecord) => pageRecord.seoTitle || '-'
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        render: (pageRecord) => (pageRecord.updatedAt ? new Date(pageRecord.updatedAt).toLocaleDateString() : '-')
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (pageRecord) => (
          <div className="admin-row-actions admin-page-actions">
            <Link to={getPagePreviewPath(pageRecord)} target="_blank" aria-label={`Preview ${pageRecord.title}`}>
              <Eye size={16} />
            </Link>
            <button type="button" onClick={() => handlePublishToggle(pageRecord)}>
              {pageRecord.status === 'PUBLISHED' ? 'Draft' : 'Publish'}
            </button>
            <button type="button" onClick={() => handleEdit(pageRecord)} aria-label={`Edit ${pageRecord.title}`}>
              <Edit3 size={16} />
            </button>
            <button type="button" onClick={() => handleDelete(pageRecord)} aria-label={`Delete ${pageRecord.title}`}>
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ];

  return (
    <main className="admin-content admin-pages-page">
      <PageHeader
        eyebrow={pageKey ? 'About' : 'Website'}
        title={pageKey ? 'About' : 'Pages'}
        description={pageKey ? 'Update the company story, mission, vision, and public About page content.' : 'Edit published website copy and SEO using structured fields tied to each public page.'}
        actions={
          <button className="admin-btn" type="button" onClick={() => loadPages(page, search)}>
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="admin-editor-card admin-page-editor" aria-label="Website page editor">
        <div className="admin-editor-card__header">
          <div>
            <span>{editingId ? 'Edit page' : 'New page'}</span>
            <h3>{editingId ? formData.title : 'Add website page'}</h3>
          </div>
          {editingId && (
            <button className="admin-icon-btn" type="button" onClick={resetForm} aria-label="Cancel editing">
              <X size={18} />
            </button>
          )}
        </div>

        <form className="admin-page-form" onSubmit={handleSubmit}>
          <label>
            Page title
            <input name="title" value={formData.title} onChange={handleChange} required minLength={2} />
          </label>
          <label>
            Slug
            <input name="slug" value={formData.slug} onChange={handleChange} required />
          </label>
            {!pageKey && <label>
            Page key
            <select name="pageKey" value={formData.pageKey} onChange={handlePageKeyChange}>
              <option value="">Select website page</option>
              {PAGE_KEY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            </label>}
          <label>
            Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label className="admin-page-form__wide">
            Excerpt
            <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} maxLength={320} />
          </label>
          <label className="admin-page-form__wide">
            Content
            <textarea name="content" value={formData.content} onChange={handleChange} rows={5} />
          </label>
          <fieldset className="admin-page-form__wide admin-page-sections">
            <legend>Visible page content</legend>
            {PAGE_SECTION_SCHEMAS[formData.pageKey]?.length ? (
              <>
                <div className="admin-page-sections__toolbar">
                  <p>
                    Scalar fields update the common website copy. Use the JSON editor below for repeatable items like
                    chips, stats, filters, customization cards, and richer layouts.
                  </p>
                  {formData.pageKey && PAGE_SECTION_TEMPLATES[formData.pageKey] && (
                    <button className="admin-btn" type="button" onClick={() => applySectionsTemplate(formData.pageKey)}>
                      Load starter template
                    </button>
                  )}
                </div>
                <div className="admin-page-sections__grid">
                  {PAGE_SECTION_SCHEMAS[formData.pageKey].map((field) => {
                    const sectionValue = formData.sections?.[field.section];
                    const value =
                      typeof sectionValue === 'string' && field.key === 'heading'
                        ? sectionValue
                        : sectionValue?.[field.key] || '';

                    return (
                      <label key={`${field.section}.${field.key}`} className={field.multiline ? 'admin-page-form__wide' : ''}>
                        {field.label}
                        {field.multiline ? (
                          <textarea value={value} onChange={(event) => handleSectionChange(field, event.target.value)} rows={3} />
                        ) : (
                          <input value={value} onChange={(event) => handleSectionChange(field, event.target.value)} />
                        )}
                      </label>
                    );
                  })}
                </div>
                <label className="admin-page-form__wide admin-page-json">
                  Sections JSON
                  <textarea
                    value={sectionsJson}
                    onChange={handleSectionsJsonChange}
                    rows={18}
                    spellCheck="false"
                  />
                  {sectionsJsonError ? (
                    <span className="admin-page-json__error">{sectionsJsonError}</span>
                  ) : (
                    <span className="admin-page-json__hint">
                      This object is stored directly in the CMS page record and can power repeatable website sections.
                    </span>
                  )}
                </label>
              </>
            ) : (
              <p>Select a page key to edit its website content fields.</p>
            )}
          </fieldset>
          <label>
            SEO title
            <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} maxLength={70} />
          </label>
          <label>
            Canonical URL
            <input name="canonicalUrl" value={formData.canonicalUrl} onChange={handleChange} placeholder="https://..." />
          </label>
          <label className="admin-page-form__wide">
            SEO description
            <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={2} maxLength={170} />
          </label>
          <label className="admin-page-form__wide">
            Open Graph image URL
            <input name="ogImage" value={formData.ogImage} onChange={handleChange} placeholder="https://..." />
          </label>
          <div className="admin-page-form__actions">
            <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
              <FilePlus2 size={18} aria-hidden="true" />
              {isSaving ? 'Saving...' : editingId ? 'Update Page' : 'Create Page'}
            </button>
            {editingId && (
              <button className="admin-btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <DataTable
        columns={columns}
        rows={pages}
        searchValue={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No website pages found"
        emptyDescription="Create page records to manage website copy and SEO data from the admin panel."
      />
    </main>
  );
}

export default AdminPagesPage;
