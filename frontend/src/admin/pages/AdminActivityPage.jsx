import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchActivityLogs } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

function AdminActivityPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalLogs: 0 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (page = 1, term = search) => {
    try {
      setIsLoading(true);
      const data = await fetchActivityLogs({ page, limit: 25, search: term || undefined });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load activity log.' });
    } finally {
      setIsLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => { load(); }, [load]);

  const columns = useMemo(() => [
    { key: 'createdAt', header: 'Time', render: (row) => new Date(row.createdAt).toLocaleString() },
    { key: 'admin', header: 'Admin', render: (row) => <div className="admin-ops-primary-cell"><strong>{row.admin?.name || 'System'}</strong><span>{row.admin?.email || '-'}</span></div> },
    { key: 'action', header: 'Action', render: (row) => row.action.replaceAll('_', ' ') },
    { key: 'entityType', header: 'Entity', render: (row) => <div className="admin-ops-primary-cell"><strong>{row.entityType || '-'}</strong><span>{row.entityId || ''}</span></div> },
    { key: 'description', header: 'Details', render: (row) => row.description || '-' },
    { key: 'ipAddress', header: 'IP', render: (row) => row.ipAddress || '-' }
  ], []);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Security" title="Activity Log" description="Review auditable admin changes across website content, sales, and settings." actions={<button className="admin-btn" type="button" onClick={() => load(pagination.currentPage)}><RefreshCw size={17} />Refresh</button>} />
    <DataTable columns={columns} rows={logs} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} pagination={pagination} onPageChange={(page) => load(page)} emptyTitle="No activity recorded" emptyDescription="Admin changes will appear here automatically." />
  </main>;
}

export default AdminActivityPage;
