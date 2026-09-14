import './PageHeader.css';

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="admin-page-header">
      <div>
        {eyebrow && <span className="admin-page-header__eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </section>
  );
}

export default PageHeader;
