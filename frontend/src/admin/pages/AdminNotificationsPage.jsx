import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCheck, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../../services/adminOperationsService.js';
import './AdminOperations.css';

function AdminNotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalNotifications: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (page = 1, term = search, onlyUnread = unreadOnly) => {
    try {
      setIsLoading(true);
      const data = await fetchNotifications({ page, limit: 25, search: term || undefined, unread: onlyUnread || undefined });
      setNotifications(data.notifications);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load notifications.' });
    } finally {
      setIsLoading(false);
    }
  }, [search, showToast, unreadOnly]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(1, search, unreadOnly), 250);
    return () => window.clearTimeout(timer);
  }, [load, search, unreadOnly]);

  async function read(notification) {
    try {
      await markNotificationRead(notification.id);
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to update notification.' });
    }
  }

  async function readAll() {
    try {
      await markAllNotificationsRead();
      showToast({ type: 'success', message: 'All notifications marked as read.' });
      await load(1);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to update notifications.' });
    }
  }

  async function remove(notification) {
    try {
      await deleteNotification(notification.id);
      showToast({ type: 'success', message: 'Notification deleted.' });
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete notification.' });
    }
  }

  const columns = useMemo(() => [
    { key: 'title', header: 'Notification', render: (row) => <div className="admin-ops-primary-cell"><strong>{row.title}</strong><span>{row.message}</span></div> },
    { key: 'type', header: 'Type', render: (row) => <StatusBadge status={row.type} /> },
    { key: 'readAt', header: 'State', render: (row) => <StatusBadge status={row.readAt ? 'READ' : 'UNREAD'} /> },
    { key: 'createdAt', header: 'Received', render: (row) => new Date(row.createdAt).toLocaleString() },
    { key: 'actions', header: 'Actions', render: (row) => <div className="admin-row-actions">{row.actionUrl && <a href={row.actionUrl} aria-label={`Open ${row.title}`}><ExternalLink size={16} /></a>}{!row.readAt && <button type="button" onClick={() => read(row)} aria-label={`Mark ${row.title} read`}><CheckCheck size={16} /></button>}{row.adminId && <button type="button" onClick={() => remove(row)} aria-label={`Delete ${row.title}`}><Trash2 size={16} /></button>}</div> }
  ], [pagination.currentPage]);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Operations" title="Notifications" description={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} across sales and content operations.`} actions={<><label className="admin-ops-toggle"><input type="checkbox" checked={unreadOnly} onChange={(event) => { setUnreadOnly(event.target.checked); load(1, search, event.target.checked); }} />Unread only</label><button className="admin-btn" type="button" onClick={readAll}><CheckCheck size={17} />Read all</button><button className="admin-btn" type="button" onClick={() => load(pagination.currentPage)}><RefreshCw size={17} />Refresh</button></>} />
    <DataTable columns={columns} rows={notifications} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} pagination={pagination} onPageChange={(nextPage) => load(nextPage)} emptyTitle="No notifications" emptyDescription="New operational events will appear here." />
  </main>;
}

export default AdminNotificationsPage;
