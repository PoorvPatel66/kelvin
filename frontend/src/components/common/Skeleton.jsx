import './Skeleton.css';

function Skeleton({ rows = 3, className = '' }) {
  return (
    <div className={`skeleton-stack ${className}`} aria-label="Loading content">
      {Array.from({ length: rows }, (_, index) => (
        <span className="skeleton-line" key={index} />
      ))}
    </div>
  );
}

export default Skeleton;
