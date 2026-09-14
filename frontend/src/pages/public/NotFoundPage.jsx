import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO.jsx';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <SEO title="Page Not Found" noindex canonicalPath="/404" />
      <section className="not-found-page__inner container-sm">
        <span className="eyebrow">404 Error</span>
        <h1>Page not found</h1>
        <p>
          This page does not exist yet, or the link points to a route that has not been added
          in the React router.
        </p>
        <div className="not-found-page__actions">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/products" className="btn btn-outline">
            View Products
          </Link>
          <Link to="/request-quote" className="btn btn-secondary">
            Request Quote
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
