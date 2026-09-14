import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCw, UserX, X } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createAdminUser, deactivateAdminUser, fetchAdminUsers, updateAdminUser } from '../../services/adminOperationsService.js';
import './AdminOperations.css';

const defaultRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'SEO_MANAGER', 'VIEWER'];
const emptyForm = { name: '', email: '', mobile: '', password: '', role: 'ADMIN', permissions: '', isActive: true };

function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(defaultRoles);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load(term = search) {
    try {
      setIsLoading(true);
      const data = await fetchAdminUsers({ search: term || undefined });
      setUsers(data.users);
      setRoles(data.roles.length ? data.roles : defaultRoles);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to load admin users.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() { setEditingId(null); setForm(emptyForm); }

  function editUser(user) {
    setEditingId(user.id);
    setForm({ name: user.name || '', email: user.email || '', mobile: user.mobile || '', password: '', role: user.role || 'ADMIN', permissions: (user.permissions || []).join(', '), isActive: Boolean(user.isActive) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const body = { ...form, permissions: form.permissions.split(',').map((value) => value.trim()).filter(Boolean) };
      if (!body.password) delete body.password;
      if (editingId) await updateAdminUser(editingId, body);
      else await createAdminUser(body);
      showToast({ type: 'success', message: editingId ? 'Admin user updated.' : 'Admin user created.' });
      resetForm();
      await load();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to save admin user.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivate(user) {
    if (!window.confirm(`Deactivate ${user.name}?`)) return;
    try {
      await deactivateAdminUser(user.id);
      showToast({ type: 'success', message: 'Admin user deactivated.' });
      await load();
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to deactivate user.' });
    }
  }

  const columns = useMemo(() => [
    { key: 'name', header: 'User', render: (user) => <div className="admin-ops-primary-cell"><strong>{user.name}</strong><span>{user.email}</span></div> },
    { key: 'role', header: 'Role', render: (user) => <StatusBadge status={user.role} /> },
    { key: 'mobile', header: 'Mobile', render: (user) => user.mobile || '-' },
    { key: 'isActive', header: 'Access', render: (user) => <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    { key: 'actions', header: 'Actions', render: (user) => <div className="admin-row-actions"><button type="button" onClick={() => editUser(user)} aria-label={`Edit ${user.name}`}><Edit3 size={16} /></button>{user.isActive && <button type="button" onClick={() => deactivate(user)} aria-label={`Deactivate ${user.name}`}><UserX size={16} /></button>}</div> }
  ], []);

  return <main className="admin-content admin-ops-page">
    <PageHeader eyebrow="Security" title="Admin Users" description="Create role-based admin accounts and control access to the CMS." actions={<button className="admin-btn" type="button" onClick={() => load()}><RefreshCw size={17} />Refresh</button>} />
    <section className="admin-ops-editor" aria-label="Admin user editor">
      <div className="admin-ops-editor__head"><div><span>{editingId ? 'Edit user' : 'New user'}</span><h3>{editingId ? form.name : 'Create admin account'}</h3></div>{editingId && <button className="admin-btn" type="button" onClick={resetForm}><X size={16} />Cancel</button>}</div>
      <form className="admin-ops-form" onSubmit={save}>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Mobile<input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
        <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
        <label className="admin-ops-form__wide">Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingId} minLength={10} placeholder={editingId ? 'Leave blank to keep current password' : 'Upper, lower, number and symbol'} /></label>
        <label className="admin-ops-form__wide">Extra permissions<input value={form.permissions} onChange={(event) => setForm({ ...form, permissions: event.target.value })} placeholder="products.manage, analytics.read" /></label>
        <label><span>Active account</span><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /></label>
        <div className="admin-ops-form__actions"><button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}><Plus size={17} />{isSaving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}</button></div>
      </form>
    </section>
    <DataTable columns={columns} rows={users} searchValue={search} onSearchChange={setSearch} isLoading={isLoading} emptyTitle="No admin users found" emptyDescription="Create a role-based admin user." />
  </main>;
}

export default AdminUsersPage;
