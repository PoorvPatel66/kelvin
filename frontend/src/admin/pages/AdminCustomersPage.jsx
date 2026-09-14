import { useEffect, useMemo, useState } from 'react';
import { Archive, Download, Edit3, Eye, MessageSquarePlus, RefreshCw, Save, UserPlus, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  addAdminCustomerNote,
  archiveAdminCustomer,
  createAdminCustomer,
  exportAdminCustomersCsv,
  fetchAdminCustomer,
  fetchAdminCustomers,
  updateAdminCustomer
} from '../../services/adminCustomerService.js';
import './AdminCustomersPage.css';

const statusOptions = ['LEAD', 'ACTIVE', 'INACTIVE', 'BLOCKED'];
const sourceOptions = ['CONTACT', 'REQUEST_QUOTE', 'NEWSLETTER', 'BROCHURE_DOWNLOAD', 'WHATSAPP', 'MANUAL'];
const emptyForm = { name: '', company: '', email: '', phone: '', country: '', status: 'LEAD', source: 'MANUAL' };

function formatLabel(value) {
  return String(value || '').replaceAll('_', ' ');
}

function formatDate(value, includeTime = false) {
  if (!value) return '-';
  const options = includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' };
  return new Date(value).toLocaleString(undefined, options);
}

function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [note, setNote] = useState('');

  const filters = useMemo(() => ({
    page,
    limit: 10,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status ? { status } : {}),
    ...(source ? { source } : {})
  }), [page, search, source, status]);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        setIsLoading(true);
        const data = await fetchAdminCustomers(filters);
        if (isMounted) {
          setCustomers(data.customers);
          setPagination(data.pagination);
        }
      } catch (error) {
        showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load customers.' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCustomers();
    return () => { isMounted = false; };
  }, [filters, reloadKey, showToast]);

  function resetForm() {
    setEditingId('');
    setForm(emptyForm);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleEdit(customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name || '', company: customer.company || '', email: customer.email || '',
      phone: customer.phone || '', country: customer.country || '', status: customer.status || 'LEAD',
      source: customer.source || 'MANUAL'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      if (editingId) await updateAdminCustomer(editingId, form);
      else await createAdminCustomer(form);
      showToast({ type: 'success', message: editingId ? 'Customer updated.' : 'Customer created.' });
      resetForm();
      setReloadKey((value) => value + 1);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save customer.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive(customer) {
    if (!window.confirm(`Archive ${customer.name}? Their inquiry history will remain available.`)) return;
    try {
      await archiveAdminCustomer(customer.id);
      if (profile?.id === customer.id) setProfile(null);
      setReloadKey((value) => value + 1);
      showToast({ type: 'success', message: 'Customer archived.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to archive customer.' });
    }
  }

  async function openProfile(customer) {
    try {
      setIsProfileLoading(true);
      setProfile(await fetchAdminCustomer(customer.id));
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load customer profile.' });
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function handleAddNote(event) {
    event.preventDefault();
    if (!profile || !note.trim()) return;
    try {
      const savedNote = await addAdminCustomerNote(profile.id, note.trim());
      setProfile((current) => ({
        ...current,
        notes: [savedNote, ...(current.notes || [])],
        _count: { ...current._count, notes: Number(current._count?.notes || 0) + 1 }
      }));
      setNote('');
      showToast({ type: 'success', message: 'Customer note added.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to add note.' });
    }
  }

  async function handleExport() {
    try {
      await exportAdminCustomersCsv({ ...(status ? { status } : {}), ...(source ? { source } : {}) });
    } catch {
      showToast({ type: 'error', message: 'Unable to export customers.' });
    }
  }

  const columns = [
    { key: 'contact', header: 'Customer', render: (customer) => <div className="admin-customer-contact"><strong>{customer.name}</strong><a href={`mailto:${customer.email}`}>{customer.email}</a><span>{customer.phone || 'No phone'}</span></div> },
    { key: 'company', header: 'Company', render: (customer) => <div className="admin-customer-meta"><strong>{customer.company || 'Individual'}</strong><span>{customer.country || 'Country not provided'}</span></div> },
    { key: 'source', header: 'Source', render: (customer) => <span className="admin-customer-source">{formatLabel(customer.source)}</span> },
    { key: 'status', header: 'Status', render: (customer) => <StatusBadge status={customer.status} /> },
    { key: 'activity', header: 'Activity', render: (customer) => <span>{customer._count?.inquiries || 0} inquiries / {customer._count?.notes || 0} notes</span> },
    { key: 'updatedAt', header: 'Updated', render: (customer) => formatDate(customer.updatedAt) },
    { key: 'actions', header: 'Actions', render: (customer) => <div className="admin-row-actions"><button type="button" onClick={() => openProfile(customer)} aria-label={`View ${customer.name}`}><Eye size={16} /></button><button type="button" onClick={() => handleEdit(customer)} aria-label={`Edit ${customer.name}`}><Edit3 size={16} /></button><button type="button" onClick={() => handleArchive(customer)} aria-label={`Archive ${customer.name}`}><Archive size={16} /></button></div> }
  ];

  return (
    <main className="admin-content admin-customers-page">
      <PageHeader eyebrow="Sales CRM" title="Customers" description="Manage customer records linked to website inquiries, quotation requests, and internal sales notes." actions={<><button className="admin-btn" type="button" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw size={18} />Refresh</button><button className="admin-btn admin-btn--primary" type="button" onClick={handleExport}><Download size={18} />Export CSV</button></>} />

      <section className="admin-customer-editor" aria-label="Customer editor">
        <div className="admin-customer-editor__head"><div><span>{editingId ? 'Edit customer' : 'New customer'}</span><h3>{editingId ? form.name : 'Add customer record'}</h3></div>{editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
        <form className="admin-customer-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" value={form.name} onChange={handleFormChange} required minLength={2} /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleFormChange} required /></label>
          <label>Company<input name="company" value={form.company} onChange={handleFormChange} /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={handleFormChange} /></label>
          <label>Country<input name="country" value={form.country} onChange={handleFormChange} /></label>
          <label>Status<select name="status" value={form.status} onChange={handleFormChange}>{statusOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}</select></label>
          <label>Source<select name="source" value={form.source} onChange={handleFormChange}>{sourceOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}</select></label>
          <div className="admin-customer-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>{editingId ? <Save size={18} /> : <UserPlus size={18} />}{isSaving ? 'Saving...' : editingId ? 'Update Customer' : 'Create Customer'}</button>{editingId && <button className="admin-btn" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
      </section>

      <div className="admin-customer-filters"><label>Status<select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}><option value="">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}</select></label><label>Source<select value={source} onChange={(event) => { setPage(1); setSource(event.target.value); }}><option value="">All sources</option>{sourceOptions.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}</select></label></div>

      <DataTable columns={columns} rows={customers} searchValue={search} onSearchChange={(value) => { setPage(1); setSearch(value); }} isLoading={isLoading} pagination={pagination} onPageChange={setPage} emptyTitle="No customers found" emptyDescription="Customer profiles are created automatically from website inquiries or can be added manually." />

      {(profile || isProfileLoading) && <div className="admin-customer-drawer-backdrop" role="presentation" onMouseDown={() => setProfile(null)}><aside className="admin-customer-drawer" aria-label="Customer profile" onMouseDown={(event) => event.stopPropagation()}>{isProfileLoading && !profile ? <p>Loading customer profile...</p> : profile && <><header><div><span>Customer profile</span><h3>{profile.name}</h3><p>{profile.company || 'Individual customer'}</p></div><button type="button" onClick={() => setProfile(null)} aria-label="Close customer profile"><X size={20} /></button></header><div className="admin-customer-profile-grid"><a href={`mailto:${profile.email}`}>{profile.email}</a><span>{profile.phone || 'No phone provided'}</span><span>{profile.country || 'No country provided'}</span><StatusBadge status={profile.status} /></div><section><h4>Inquiry history ({profile._count?.inquiries || 0})</h4><div className="admin-customer-history">{(profile.inquiries || []).length === 0 ? <p>No linked inquiries.</p> : profile.inquiries.map((inquiry) => <article key={inquiry.id}><div><strong>{formatLabel(inquiry.type)}</strong><StatusBadge status={inquiry.status} /></div><span>{inquiry.product || 'General inquiry'} · {formatDate(inquiry.createdAt)}</span><p>{inquiry.message || 'No message provided.'}</p></article>)}</div></section><section><h4>Internal notes ({profile._count?.notes || 0})</h4><form className="admin-customer-note-form" onSubmit={handleAddNote}><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a private sales note..." required minLength={2} rows={3} /><button className="admin-btn admin-btn--primary" type="submit"><MessageSquarePlus size={17} />Add Note</button></form><div className="admin-customer-notes">{(profile.notes || []).length === 0 ? <p>No notes yet.</p> : profile.notes.map((item) => <article key={item.id}><p>{item.message}</p><span>{item.admin?.name || 'Admin'} · {formatDate(item.createdAt, true)}</span></article>)}</div></section></>}</aside></div>}
    </main>
  );
}

export default AdminCustomersPage;
