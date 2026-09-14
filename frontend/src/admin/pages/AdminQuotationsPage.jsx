import { useEffect, useMemo, useState } from 'react';
import { Download, Edit3, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fetchAdminCustomers } from '../../services/adminCustomerService.js';
import {
  createQuotation,
  deleteQuotation,
  downloadQuotationPdf,
  fetchQuotations,
  updateQuotation,
  updateQuotationStatus
} from '../../services/adminOperationsService.js';
import './AdminOperations.css';

const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
const emptyItem = { name: '', description: '', quantity: 1, unitPrice: 0 };
const emptyForm = {
  customerId: '', status: 'DRAFT', currency: 'INR', taxRate: 0, discountAmount: 0,
  validUntil: '', notes: '', terms: '', items: [{ ...emptyItem }]
};

function AdminQuotationsPage() {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalQuotations: 0 });
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load(page = 1, term = search) {
    try {
      setIsLoading(true);
      const [quotationData, customerData] = await Promise.all([
        fetchQuotations({ page, limit: 20, search: term || undefined }),
        customers.length ? Promise.resolve({ customers }) : fetchAdminCustomers({ page: 1, limit: 100 })
      ]);
      setQuotations(quotationData.quotations);
      setPagination(quotationData.pagination);
      setCustomers(customerData.customers || []);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load quotations.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, items: [{ ...emptyItem }] });
  }

  function editQuotation(quotation) {
    setEditingId(quotation.id);
    setForm({
      customerId: quotation.customerId || '',
      status: quotation.status || 'DRAFT',
      currency: quotation.currency || 'INR',
      taxRate: Number(quotation.taxRate || 0),
      discountAmount: Number(quotation.discountAmount || 0),
      validUntil: quotation.validUntil ? quotation.validUntil.slice(0, 10) : '',
      notes: quotation.notes || '',
      terms: quotation.terms || '',
      items: quotation.items?.length
        ? quotation.items.map((item) => ({ name: item.name, description: item.description || '', quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }))
        : [{ ...emptyItem }]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateItem(index, key, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)
    }));
  }

  function removeItem(index) {
    setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function save(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const body = {
        ...form,
        taxRate: Number(form.taxRate || 0),
        discountAmount: Number(form.discountAmount || 0),
        validUntil: form.validUntil || null,
        items: form.items.map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }))
      };
      if (editingId) await updateQuotation(editingId, body);
      else await createQuotation(body);
      showToast({ type: 'success', message: editingId ? 'Quotation updated.' : 'Quotation created.' });
      resetForm();
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save quotation.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(quotation, status) {
    try {
      await updateQuotationStatus(quotation.id, status);
      showToast({ type: 'success', message: 'Quotation status updated.' });
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to update status.' });
    }
  }

  async function removeQuotation(quotation) {
    if (!window.confirm(`Delete ${quotation.quotationNumber}? Draft quotations only can be deleted.`)) return;
    try {
      await deleteQuotation(quotation.id);
      showToast({ type: 'success', message: 'Quotation deleted.' });
      await load(pagination.currentPage);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete quotation.' });
    }
  }

  const columns = useMemo(() => [
    { key: 'quotationNumber', header: 'Quotation', render: (row) => <div className="admin-ops-primary-cell"><strong>{row.quotationNumber}</strong><span>{row.customer?.company || row.customer?.name || 'Customer'}</span></div> },
    { key: 'total', header: 'Total', render: (row) => `${row.currency} ${Number(row.total || 0).toLocaleString()}` },
    { key: 'status', header: 'Status', render: (row) => <select className="admin-ops-inline-select" value={row.status} onChange={(event) => changeStatus(row, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select> },
    { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'actions', header: 'Actions', render: (row) => <div className="admin-row-actions"><button type="button" onClick={() => downloadQuotationPdf(row)} aria-label={`Download ${row.quotationNumber}`}><Download size={16} /></button><button type="button" onClick={() => editQuotation(row)} aria-label={`Edit ${row.quotationNumber}`}><Edit3 size={16} /></button>{row.status === 'DRAFT' && <button type="button" onClick={() => removeQuotation(row)} aria-label={`Delete ${row.quotationNumber}`}><Trash2 size={16} /></button>}</div> }
  ], [pagination.currentPage]);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Sales" title="Quotations" description="Create customer quotations, manage status, and download branded PDF copies." actions={<button className="admin-btn" type="button" onClick={() => load(pagination.currentPage)}><RefreshCw size={17} />Refresh</button>} />
    <section className="admin-ops-editor" aria-label="Quotation editor">
      <div className="admin-ops-editor__head"><div><span>{editingId ? 'Edit quotation' : 'New quotation'}</span><h3>{editingId ? 'Update commercial offer' : 'Create commercial offer'}</h3></div>{editingId && <button className="admin-btn" type="button" onClick={resetForm}><X size={16} />Cancel</button>}</div>
      <form className="admin-ops-form" onSubmit={save}>
        <label>Customer<select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company || customer.name} ({customer.email})</option>)}</select></label>
        <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Currency<input maxLength="3" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} required /></label>
        <label>Valid until<input type="date" value={form.validUntil} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} /></label>
        <label>Tax rate (%)<input type="number" min="0" step="0.01" value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: event.target.value })} /></label>
        <label>Discount amount<input type="number" min="0" step="0.01" value={form.discountAmount} onChange={(event) => setForm({ ...form, discountAmount: event.target.value })} /></label>
        <fieldset className="admin-ops-form__wide admin-ops-items"><legend>Quotation items</legend>{form.items.map((item, index) => <div className="admin-ops-item" key={index}><input placeholder="Product or service" value={item.name} onChange={(event) => updateItem(index, 'name', event.target.value)} required /><input placeholder="Description" value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} /><input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} aria-label="Quantity" required /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} aria-label="Unit price" required />{form.items.length > 1 && <button type="button" onClick={() => removeItem(index)} aria-label="Remove item"><Trash2 size={16} /></button>}</div>)}<button className="admin-btn" type="button" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}><Plus size={16} />Add item</button></fieldset>
        <label className="admin-ops-form__wide">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <label className="admin-ops-form__wide">Terms<textarea value={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.value })} /></label>
        <div className="admin-ops-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Plus size={17} />{isSaving ? 'Saving...' : editingId ? 'Update Quotation' : 'Create Quotation'}</button></div>
      </form>
    </section>
    <DataTable columns={columns} rows={quotations} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} pagination={pagination} onPageChange={(page) => load(page)} emptyTitle="No quotations found" emptyDescription="Create a quotation for an existing customer." />
  </main>;
}

export default AdminQuotationsPage;
