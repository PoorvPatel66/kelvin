import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Edit3, Eye, Plus, RotateCcw, Trash2 } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  bulkUpdateAdminProducts,
  deleteAdminProduct,
  duplicateAdminProduct,
  fetchAdminProducts,
  permanentlyDeleteAdminProduct,
  restoreAdminProduct
} from '../../services/adminProductService.js';
import './AdminProductsPage.css';

function AdminProductsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [query, setQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrash, setShowTrash] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const searchTerm = searchParams.get('search') || '';
    setQuery(searchTerm);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await fetchAdminProducts({
          page,
          limit: 10,
          search: query || undefined,
          trash: showTrash || undefined
        });

        if (isMounted) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Unable to load products.' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [page, query, refreshKey, showToast, showTrash]);

  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [showTrash]);

  async function handleDelete(product) {
    const confirmed = window.confirm(`Soft delete "${product.name}"?`);
    if (!confirmed) return;

    try {
      await deleteAdminProduct(product.id);
      showToast({ type: 'success', message: 'Product moved to inactive state.' });
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to delete product.' });
    }
  }

  async function handleRestore(product) {
    try {
      await restoreAdminProduct(product.id);
      showToast({ type: 'success', message: 'Product restored as inactive.' });
      setRefreshKey((value) => value + 1);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to restore product.' });
    }
  }

  async function handleDuplicate(product) {
    try {
      const copy = await duplicateAdminProduct(product.id);
      showToast({ type: 'success', message: 'Draft copy created.' });
      setRefreshKey((value) => value + 1);
      window.location.assign(`/admin/products/${copy.id}/edit`);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to duplicate product.' });
    }
  }

  async function handlePermanentDelete(product) {
    if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await permanentlyDeleteAdminProduct(product.id);
      showToast({ type: 'success', message: 'Product permanently deleted.' });
      setRefreshKey((value) => value + 1);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to permanently delete product.' });
    }
  }

  function toggleSelected(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function runBulkAction() {
    if (!bulkAction || selectedIds.length === 0) return;
    const payloadByAction = {
      activate: { action: 'status', status: 'ACTIVE' },
      deactivate: { action: 'status', status: 'INACTIVE' },
      draft: { action: 'status', status: 'DRAFT' },
      feature: { action: 'featured', featured: true },
      unfeature: { action: 'featured', featured: false },
      delete: { action: 'delete' },
      restore: { action: 'restore' },
      permanent: { action: 'permanent-delete' }
    };
    if (bulkAction === 'permanent' && !window.confirm('Permanently delete all selected products?')) return;
    try {
      await bulkUpdateAdminProducts({ ids: selectedIds, ...payloadByAction[bulkAction] });
      showToast({ type: 'success', message: 'Bulk action completed.' });
      setBulkAction('');
      setSelectedIds([]);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Bulk action failed.' });
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            aria-label="Select all products on page"
            checked={products.length > 0 && products.every((product) => selectedIds.includes(product.id))}
            onChange={(event) => setSelectedIds(event.target.checked ? products.map((product) => product.id) : [])}
          />
        ),
        render: (product) => (
          <input
            type="checkbox"
            aria-label={`Select ${product.name}`}
            checked={selectedIds.includes(product.id)}
            onChange={() => toggleSelected(product.id)}
          />
        )
      },
      {
        key: 'product',
        header: 'Product',
        render: (product) => (
          <div className="admin-product-cell">
            <img
              src={product.images?.[0]?.url || '/images/home/hero-packaging-1.png'}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div>
              <strong>{product.name}</strong>
              <span>{product.slug}</span>
            </div>
          </div>
        )
      },
      {
        key: 'category',
        header: 'Category',
        render: (product) => product.category?.name || 'Unassigned'
      },
      {
        key: 'status',
        header: 'Status',
        render: (product) => <StatusBadge status={product.status} />
      },
      {
        key: 'featured',
        header: 'Featured',
        render: (product) => (product.featured ? 'Yes' : 'No')
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        render: (product) => (product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '-')
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (product) => (
          <div className="admin-row-actions">
            {showTrash ? (
              <>
                <button type="button" onClick={() => handleRestore(product)} aria-label={`Restore ${product.name}`}>
                  <RotateCcw size={16} />
                </button>
                <button type="button" onClick={() => handlePermanentDelete(product)} aria-label={`Permanently delete ${product.name}`}>
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to={`/products/${product.slug}`} target="_blank" aria-label={`Preview ${product.name}`}>
                  <Eye size={16} />
                </Link>
                <Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
                  <Edit3 size={16} />
                </Link>
                <button type="button" onClick={() => handleDuplicate(product)} aria-label={`Duplicate ${product.name}`}>
                  <Copy size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(product)} aria-label={`Delete ${product.name}`}>
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )
      }
    ],
    [products, selectedIds, showTrash]
  );

  return (
    <main className="admin-content">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage Kelvin Eco Products catalog items. This table uses the existing protected product API and soft-delete behavior."
        actions={
          <Link className="admin-btn admin-btn--primary" to="/admin/products/new">
            <Plus size={18} aria-hidden="true" />
            New Product
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={products}
        searchValue={query}
        onSearchChange={(value) => {
          setPage(1);
          setQuery(value);
          setSearchParams(value ? { search: value } : {});
        }}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        toolbarActions={
          <div className="admin-products-toolbar">
            <button className="admin-btn" type="button" onClick={() => setShowTrash((value) => !value)}>
              {showTrash ? 'Active products' : 'Trash'}
            </button>
            <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} aria-label="Bulk action">
              <option value="">Bulk action</option>
              {showTrash ? (
                <>
                  <option value="restore">Restore</option>
                  <option value="permanent">Delete permanently</option>
                </>
              ) : (
                <>
                  <option value="activate">Set active</option>
                  <option value="deactivate">Set inactive</option>
                  <option value="draft">Move to draft</option>
                  <option value="feature">Feature</option>
                  <option value="unfeature">Remove featured</option>
                  <option value="delete">Move to trash</option>
                </>
              )}
            </select>
            <button className="admin-btn admin-btn--primary" type="button" onClick={runBulkAction} disabled={!bulkAction || !selectedIds.length}>
              Apply ({selectedIds.length})
            </button>
          </div>
        }
        emptyTitle="No products found"
        emptyDescription="Create the first catalog product or adjust your search query."
      />
    </main>
  );
}

export default AdminProductsPage;
