import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminNavigation } from '../data/adminNavigation.js';
import './AdminLayout.css';

function getPageTitle(pathname) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return 'Dashboard';
  if (segments.includes('new')) return 'New Product';
  if (segments.includes('edit')) return 'Edit Product';

  return segments[segments.length - 1]
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function AdminLayout() {
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);
  const visibleNavigation = useMemo(
    () => adminNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.roles || item.roles.includes(admin?.role))
      }))
      .filter((group) => group.items.length > 0),
    [admin?.role]
  );

  async function handleLogout() {
    await logout();
    showToast({ type: 'info', message: 'Signed out.' });
    navigate('/admin/login', { replace: true });
  }

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  function handleAdminSearch(event) {
    event.preventDefault();
    const searchTerm = adminSearch.trim();

    if (!searchTerm) {
      showToast({ type: 'info', message: 'Type a product name or slug to search.' });
      return;
    }

    navigate(`/admin/products?search=${encodeURIComponent(searchTerm)}`);
    closeMobileMenu();
  }

  return (
    <div className={`admin-shell ${isCollapsed ? 'admin-shell--collapsed' : ''}`}>
      <button
        className="admin-shell__mobile-toggle"
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open admin navigation"
      >
        <Menu size={20} />
      </button>

      <aside className={`admin-sidebar ${isMobileOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <button
            className="admin-sidebar__close"
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close admin navigation"
          >
            <X size={18} />
          </button>
          <div className="admin-sidebar__mark">K</div>
          <div className="admin-sidebar__brand-text">
            <strong>Kelvin Admin</strong>
            <span>Content control</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {visibleNavigation.map((group) => (
            <div className="admin-sidebar__group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const className = ({ isActive }) =>
                  `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`;

                return (
                  <NavLink
                    className={className}
                    to={item.path}
                    key={item.path}
                    onClick={closeMobileMenu}
                    end={item.path === '/admin' || item.path === '/admin/dashboard'}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__collapse" type="button" onClick={() => setIsCollapsed((value) => !value)}>
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
          <button className="admin-sidebar__logout" type="button" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isMobileOpen && <button className="admin-shell__scrim" type="button" onClick={closeMobileMenu} aria-label="Close menu" />}

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-header__eyebrow">Kelvin Eco Products</span>
            <h1>{pageTitle}</h1>
          </div>

          <div className="admin-header__actions">
            <form className="admin-header__search" onSubmit={handleAdminSearch} role="search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search products..."
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
                aria-label="Search admin products"
              />
              <button type="submit" aria-label="Search products">
                <Search size={15} aria-hidden="true" />
              </button>
            </form>
            <a className="admin-header__icon" href="/" target="_blank" rel="noreferrer" aria-label="Open website">
              <ExternalLink size={18} />
            </a>
            <div className="admin-header__profile">
              <UserCircle size={24} aria-hidden="true" />
              <div>
                <strong>{admin?.name || 'Admin'}</strong>
                <span>{admin?.role || 'ADMIN'}</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
