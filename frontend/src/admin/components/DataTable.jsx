import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import './DataTable.css';

function DataTable({
  columns,
  rows,
  rowKey = 'id',
  searchValue,
  onSearchChange,
  isLoading,
  pagination,
  onPageChange,
  toolbarActions,
  emptyTitle,
  emptyDescription
}) {
  const totalRecords = pagination
    ? pagination.totalRecords ??
      pagination.totalProducts ??
      pagination.totalVariants ??
      pagination.totalQuotations ??
      pagination.totalNotifications ??
      pagination.totalLogs ??
      pagination.totalUsers ??
      pagination.totalCustomers ??
      pagination.totalCatalogs ??
      rows.length
    : 0;

  return (
    <section className="admin-table-card">
      <div className="admin-table-card__toolbar">
        <label className="admin-table-card__search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search records..."
          />
        </label>
        {toolbarActions || (
          <button className="admin-table-card__filter" type="button" disabled>
            <SlidersHorizontal size={17} aria-hidden="true" />
            Filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="admin-table-card__loading">Loading records...</div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="admin-table-card__scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key}>{column.header}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.header}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <div className="admin-table-card__pagination">
          <span>Page {pagination.currentPage} of {pagination.totalPages} | {totalRecords} records</span>
          <div>
            <button type="button" onClick={() => onPageChange?.(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1} aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => onPageChange?.(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages} aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DataTable;
