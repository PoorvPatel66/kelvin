import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminPages, updateAdminPage } from '../../services/adminPageService.js';
import './AdminCustomizationPage.css';

const emptyHero = {
  eyebrow: 'Customize Packaging',
  heading: 'Make every package carry your brand.',
  description: 'Add your logo, artwork, labels, colors, and export-ready brand details across your packaging range.'
};

function createItem() {
  return {
    id: globalThis.crypto?.randomUUID?.() || `custom-${Date.now()}`,
    title: '',
    text: '',
    image: ''
  };
}

function normalizeItems(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => ({
    id: item.id || `custom-${index + 1}`,
    title: item.title || '',
    text: item.text || '',
    image: item.image || ''
  }));
}

function AdminCustomizationPage() {
  const { showToast } = useToast();
  const [pageRecord, setPageRecord] = useState(null);
  const [hero, setHero] = useState(emptyHero);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchAdminPages({ page: 1, limit: 100, search: 'customize' });
      const record = result.pages.find((item) => item.pageKey === 'customize');

      if (!record) {
        setPageRecord(null);
        setHero(emptyHero);
        setItems([]);
        showToast({ type: 'error', message: 'The Customize website page record was not found. Run the backend seed once.' });
        return;
      }

      setPageRecord(record);
      setHero({ ...emptyHero, ...(record.sections?.hero || {}) });
      setItems(normalizeItems(record.sections?.customization?.items));
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load customization content.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveItem(index, direction) {
    setItems((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!pageRecord) return;

    const normalizedItems = items
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        text: item.text.trim(),
        image: item.image.trim()
      }))
      .filter((item) => item.title && item.image);

    try {
      setIsSaving(true);
      const updated = await updateAdminPage(pageRecord.id, {
        status: 'PUBLISHED',
        sections: {
          ...(pageRecord.sections || {}),
          hero,
          customization: { items: normalizedItems }
        }
      });
      setPageRecord(updated);
      setItems(normalizeItems(updated.sections?.customization?.items));
      showToast({ type: 'success', message: 'Customization section published to the product page.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save customization content.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="admin-content admin-customization-page">
      <PageHeader
        eyebrow="Website"
        title="Customization Section"
        description="Manage the heading, images, descriptions, order, and visibility of customization examples shown on the public product page."
        actions={(
          <>
            <Link className="admin-btn" to="/admin/media">
              <ImagePlus size={18} aria-hidden="true" />
              Media Library
            </Link>
            <button className="admin-btn" type="button" onClick={load} disabled={isLoading}>
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
          </>
        )}
      />

      <form className="admin-customization-form" onSubmit={handleSubmit}>
        <section className="admin-editor-card admin-customization-hero" aria-labelledby="customization-heading-editor">
          <div className="admin-editor-card__header">
            <div>
              <span>Public section</span>
              <h3 id="customization-heading-editor">Heading content</h3>
            </div>
          </div>
          <div className="admin-customization-fields">
            <label>
              Eyebrow
              <input value={hero.eyebrow} onChange={(event) => setHero((current) => ({ ...current, eyebrow: event.target.value }))} required />
            </label>
            <label>
              Heading
              <input value={hero.heading} onChange={(event) => setHero((current) => ({ ...current, heading: event.target.value }))} required />
            </label>
            <label className="admin-customization-fields__wide">
              Description
              <textarea value={hero.description} onChange={(event) => setHero((current) => ({ ...current, description: event.target.value }))} rows={3} required />
            </label>
          </div>
        </section>

        <section className="admin-editor-card" aria-labelledby="customization-items-editor">
          <div className="admin-editor-card__header">
            <div>
              <span>Marquee content</span>
              <h3 id="customization-items-editor">Customization examples ({items.length})</h3>
            </div>
            <button className="admin-btn" type="button" onClick={() => setItems((current) => [...current, createItem()])}>
              <Plus size={18} aria-hidden="true" />
              Add example
            </button>
          </div>

          <div className="admin-customization-list">
            {items.map((item, index) => (
              <article className="admin-customization-item" key={item.id}>
                <div className="admin-customization-item__preview">
                  {item.image ? <img src={item.image} alt="" /> : <ImagePlus size={28} aria-hidden="true" />}
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="admin-customization-item__fields">
                  <label>
                    Internal title
                    <input value={item.title} onChange={(event) => updateItem(index, 'title', event.target.value)} required />
                  </label>
                  <label>
                    Image URL
                    <input value={item.image} onChange={(event) => updateItem(index, 'image', event.target.value)} placeholder="/images/... or https://..." required />
                  </label>
                  <label className="admin-customization-fields__wide">
                    Description
                    <textarea value={item.text} onChange={(event) => updateItem(index, 'text', event.target.value)} rows={2} />
                  </label>
                </div>
                <div className="admin-customization-item__actions">
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label={`Move ${item.title || 'item'} up`}>
                    <ArrowUp size={17} />
                  </button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label={`Move ${item.title || 'item'} down`}>
                    <ArrowDown size={17} />
                  </button>
                  <button type="button" onClick={() => removeItem(index)} aria-label={`Delete ${item.title || 'item'}`}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!items.length && !isLoading && (
              <div className="admin-customization-empty">
                <ImagePlus size={30} aria-hidden="true" />
                <p>Add at least one customization example. The public website keeps its built-in fallback until you publish.</p>
              </div>
            )}
          </div>
        </section>

        <div className="admin-customization-savebar">
          <p>Saving publishes this managed content immediately to <strong>/products#customize</strong>.</p>
          <button className="admin-btn admin-btn--primary" type="submit" disabled={!pageRecord || isSaving || isLoading}>
            <Save size={18} aria-hidden="true" />
            {isSaving ? 'Publishing...' : 'Save and Publish'}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdminCustomizationPage;
