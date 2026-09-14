import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Globe2, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createAdminExportCountry,
  deleteAdminExportCountry,
  fetchAdminExportCountries,
  updateAdminExportCountry
} from '../../services/exportCountryService.js';
import './AdminExportMarketsPage.css';

const emptyForm = { countryName: '', flagUrl: '', status: 'ACTIVE' };

function AdminExportMarketsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await fetchAdminExportCountries());
    } catch {
      showToast({ type: 'error', message: 'Unable to load export markets.' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? items.filter((item) => item.countryName.toLowerCase().includes(term)) : items;
  }, [items, search]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({ countryName: item.countryName, flagUrl: item.flagUrl || '', status: item.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = { ...form, flagUrl: form.flagUrl || null };
    try {
      setIsSaving(true);
      const saved = editingId
        ? await updateAdminExportCountry(editingId, payload)
        : await createAdminExportCountry(payload);
      setItems((current) => (editingId
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved]).sort((a, b) => a.countryName.localeCompare(b.countryName)));
      showToast({ type: 'success', message: editingId ? 'Export market updated.' : 'Export market created.' });
      resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save export market.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete export market "${item.countryName}"?`)) return;
    try {
      await deleteAdminExportCountry(item.id);
      setItems((current) => current.filter((record) => record.id !== item.id));
      showToast({ type: 'success', message: 'Export market deleted.' });
      if (editingId === item.id) resetForm();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete export market.' });
    }
  }

  const columns = [
    {
      key: 'countryName',
      header: 'Market',
      render: (item) => <div className="admin-export-market"><span>{item.flagUrl ? <img src={item.flagUrl} alt="" /> : <Globe2 size={20} />}</span><strong>{item.countryName}</strong></div>
    },
    { key: 'flagUrl', header: 'Flag source', render: (item) => item.flagUrl || 'Not set' },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => <div className="admin-row-actions"><button type="button" onClick={() => handleEdit(item)} aria-label={`Edit ${item.countryName}`}><Edit3 size={16} /></button><button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${item.countryName}`}><Trash2 size={16} /></button></div>
    }
  ];

  return (
    <main className="admin-content admin-export-markets-page">
      <PageHeader eyebrow="Website" title="Export Markets" description="Manage the active countries displayed in the public We Export To section." actions={<button className="admin-btn" type="button" onClick={loadItems}><RefreshCw size={18} />Refresh</button>} />
      <section className="admin-editor-card" aria-label="Export market editor">
        <div className="admin-editor-card__header"><div><span>{editingId ? 'Edit market' : 'New market'}</span><h3>{editingId ? form.countryName : 'Add export country'}</h3></div>{editingId && <button className="admin-icon-btn" type="button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
        <form className="admin-export-market-form" onSubmit={handleSubmit}>
          <label>Country name<input value={form.countryName} onChange={(event) => setForm((current) => ({ ...current, countryName: event.target.value }))} required minLength={2} /></label>
          <label>Flag image URL<input type="url" value={form.flagUrl} onChange={(event) => setForm((current) => ({ ...current, flagUrl: event.target.value }))} placeholder="https://flagcdn.com/w80/ae.png" /></label>
          <label>Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="INACTIVE">Inactive</option></select></label>
          <div className="admin-export-market-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Globe2 size={18} />{isSaving ? 'Saving...' : editingId ? 'Update Market' : 'Create Market'}</button>{editingId && <button className="admin-btn" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
      </section>
      <DataTable columns={columns} rows={filtered} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} emptyTitle="No export markets found" emptyDescription="Add a country to the public export section." />
    </main>
  );
}

export default AdminExportMarketsPage;
