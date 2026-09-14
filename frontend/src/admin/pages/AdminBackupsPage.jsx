import { useEffect, useMemo, useState } from 'react';
import { DatabaseBackup, Download, RefreshCw, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createBackup, deleteBackup, downloadBackup, fetchBackups } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

function AdminBackupsPage() {
  const { showToast } = useToast();
  const [backups, setBackups] = useState([]);
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  async function load() {
    try { setIsLoading(true); setBackups(await fetchBackups()); }
    catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load backups.' }); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createSnapshot(event) {
    event.preventDefault();
    try {
      setIsCreating(true);
      await createBackup(label.trim());
      setLabel('');
      showToast({ type: 'success', message: 'Backup snapshot created.' });
      await load();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to create backup.' });
    } finally {
      setIsCreating(false);
    }
  }

  async function remove(backup) {
    if (!window.confirm(`Delete backup "${backup.label}"?`)) return;
    try { await deleteBackup(backup.id); showToast({ type: 'success', message: 'Backup deleted.' }); await load(); }
    catch (error) { showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete backup.' }); }
  }

  const columns = useMemo(() => [
    { key: 'label', header: 'Snapshot', render: (row) => <div className="admin-ops-primary-cell"><strong>{row.label}</strong><span>By {row.createdBy?.name || 'Admin'}</span></div> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'tableCounts', header: 'Records', render: (row) => Object.values(row.tableCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0).toLocaleString() },
    { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
    { key: 'actions', header: 'Actions', render: (row) => <div className="admin-row-actions">{row.status === 'COMPLETE' && <button type="button" onClick={() => downloadBackup(row)} aria-label={`Download ${row.label}`}><Download size={16} /></button>}<button type="button" onClick={() => remove(row)} aria-label={`Delete ${row.label}`}><Trash2 size={16} /></button></div> }
  ], []);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Recovery" title="Backups" description="Create downloadable CMS snapshots before major content or catalog changes." actions={<button className="admin-btn" type="button" onClick={load}><RefreshCw size={17} />Refresh</button>} />
    <section className="admin-ops-editor" aria-label="Create backup"><form className="admin-ops-backup-form" onSubmit={createSnapshot}><label>Snapshot label<input value={label} onChange={(event) => setLabel(event.target.value)} maxLength="160" placeholder="Before catalogue update" /></label><button className="admin-btn admin-btn--primary" type="submit" disabled={isCreating}><DatabaseBackup size={17} />{isCreating ? 'Creating...' : 'Create Backup'}</button></form></section>
    <DataTable columns={columns} rows={backups} searchValue="" onSearchChange={() => {}} isLoading={isLoading} emptyTitle="No backups created" emptyDescription="Create a snapshot before a large admin update." />
  </main>;
}

export default AdminBackupsPage;
