import './StatusBadge.css';

function StatusBadge({ status = 'UNKNOWN' }) {
  const normalized = String(status).toLowerCase();
  return <span className={`admin-status admin-status--${normalized}`}>{String(status).replaceAll('_', ' ')}</span>;
}

export default StatusBadge;
