import { Inbox } from 'lucide-react';
import './EmptyState.css';

function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="admin-empty">
      <span className="admin-empty__icon">
        <Inbox size={30} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="admin-empty__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
