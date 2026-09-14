import { useEffect, useMemo, useState } from 'react';
import { Download, MessageSquarePlus, RefreshCw, Send } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  addAdminInquiryNote,
  exportAdminInquiriesCsv,
  fetchAdminInquiries,
  resendAdminInquiryNotification,
  updateAdminInquiryStatus
} from '../../services/adminInquiryService.js';
import './AdminInquiriesPage.css';

const statusOptions = ['NEW', 'OPEN', 'REPLIED', 'CLOSED'];

const typeLabels = {
  CONTACT: 'Contact',
  REQUEST_QUOTE: 'Quote Request',
  NEWSLETTER: 'Newsletter',
  BROCHURE_DOWNLOAD: 'Brochure Download',
  WHATSAPP: 'WhatsApp CTA'
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function AdminInquiriesPage({
  type,
  title = 'Inquiries',
  description = 'Manage website inquiries submitted from public forms.'
}) {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {})
    }),
    [page, search, status, type]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInquiries() {
      try {
        setIsLoading(true);
        const data = await fetchAdminInquiries(filters);

        if (isMounted) {
          setInquiries(data.inquiries);
          setPagination(data.pagination);
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Unable to load inquiries.' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInquiries();

    return () => {
      isMounted = false;
    };
  }, [filters, showToast]);

  async function handleStatusChange(inquiry, nextStatus) {
    try {
      setBusyId(inquiry.id);
      const updated = await updateAdminInquiryStatus(inquiry.id, nextStatus);
      setInquiries((current) => current.map((item) => (item.id === inquiry.id ? updated : item)));
      showToast({ type: 'success', message: 'Inquiry status updated.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to update status.' });
    } finally {
      setBusyId('');
    }
  }

  async function handleAddNote(inquiry) {
    const message = window.prompt(`Add internal note for ${inquiry.name}:`);
    if (!message?.trim()) return;

    try {
      setBusyId(inquiry.id);
      const note = await addAdminInquiryNote(inquiry.id, message.trim());
      setInquiries((current) =>
        current.map((item) => (item.id === inquiry.id ? { ...item, notes: [note, ...(item.notes || [])] } : item))
      );
      showToast({ type: 'success', message: 'Note added.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to add note.' });
    } finally {
      setBusyId('');
    }
  }

  async function handleResend(inquiry) {
    try {
      setBusyId(inquiry.id);
      const result = await resendAdminInquiryNotification(inquiry.id);
      showToast({
        type: result.sent ? 'success' : 'warning',
        message: result.message || 'Notification request completed.'
      });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to resend notification.' });
    } finally {
      setBusyId('');
    }
  }

  async function handleExport() {
    try {
      const { page: _page, limit: _limit, ...exportFilters } = filters;
      await exportAdminInquiriesCsv(exportFilters);
    } catch (error) {
      showToast({ type: 'error', message: 'Unable to export inquiries.' });
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'contact',
        header: 'Contact',
        render: (inquiry) => (
          <div className="admin-inquiry-contact">
            <strong>{inquiry.name}</strong>
            <span>{inquiry.company || 'No company'}</span>
            <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </div>
        )
      },
      {
        key: 'type',
        header: 'Type',
        render: (inquiry) => <span className="admin-inquiry-type">{typeLabels[inquiry.type] || inquiry.type}</span>
      },
      {
        key: 'details',
        header: 'Details',
        render: (inquiry) => (
          <div className="admin-inquiry-details">
            <strong>{inquiry.product || 'General inquiry'}</strong>
            <span>{inquiry.country || 'Country not provided'}</span>
            <p>{inquiry.message || 'No message provided.'}</p>
          </div>
        )
      },
      {
        key: 'status',
        header: 'Status',
        render: (inquiry) => (
          <div className="admin-inquiry-status">
            <StatusBadge status={inquiry.status} />
            <select
              value={inquiry.status}
              onChange={(event) => handleStatusChange(inquiry, event.target.value)}
              disabled={busyId === inquiry.id}
              aria-label={`Change status for ${inquiry.name}`}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        )
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (inquiry) => formatDate(inquiry.createdAt)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (inquiry) => (
          <div className="admin-row-actions">
            <button
              type="button"
              onClick={() => handleAddNote(inquiry)}
              disabled={busyId === inquiry.id}
              aria-label={`Add note for ${inquiry.name}`}
            >
              <MessageSquarePlus size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleResend(inquiry)}
              disabled={busyId === inquiry.id}
              aria-label={`Resend notification for ${inquiry.name}`}
            >
              <Send size={16} />
            </button>
          </div>
        )
      }
    ],
    [busyId]
  );

  return (
    <main className="admin-content">
      <PageHeader
        eyebrow="Sales CRM"
        title={title}
        description={description}
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setPage(1)}>
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
            <button className="admin-btn admin-btn--primary" type="button" onClick={handleExport}>
              <Download size={18} aria-hidden="true" />
              Export CSV
            </button>
          </>
        }
      />

      <div className="admin-inquiry-filters">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataTable
        columns={columns}
        rows={inquiries}
        searchValue={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No inquiries found"
        emptyDescription="New website inquiries will appear here after customers submit public forms."
      />
    </main>
  );
}

export default AdminInquiriesPage;
