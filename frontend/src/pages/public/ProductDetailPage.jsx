import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import OptimizedImage from '../../components/common/OptimizedImage.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import Breadcrumbs from '../../components/seo/Breadcrumbs.jsx';
import SEO from '../../components/seo/SEO.jsx';
import { fetchProductBySlug } from '../../services/productService.js';
import { breadcrumbSchema, productSchema } from '../../seo/schema.js';
import { getFallbackDisplayProduct, normalizeProductForDisplay } from '../../utils/productDisplay.js';
import './ProductDetailPage.css';

function getVariantId(label) {
  return label
    .toLowerCase()
    .replace(/paper cups$/, 'paper cup')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        const apiProduct = await fetchProductBySlug(slug);

        if (isMounted) {
          setProduct(apiProduct ? normalizeProductForDisplay(apiProduct) : getFallbackDisplayProduct(slug));
        }
      } catch (error) {
        if (isMounted) {
          setProduct(getFallbackDisplayProduct(slug));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="product-detail section">
        <div className="container-xl">
          <Skeleton rows={4} />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail section">
        <SEO title="Product Not Found" noindex />
        <div className="container-sm">
          <Link to="/" className="blog-detail__back">
            <FaArrowLeft aria-hidden="true" />
            Back to Home
          </Link>
          <h1>Product not found</h1>
          <p>The product you are looking for is not available.</p>
        </div>
      </main>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/products/${product.slug}` }
  ];
  const heroImage = product.images?.[0]?.url || product.image;

  return (
    <main className="product-detail">
      <SEO
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.shortDescription || product.description}
        image={product.ogImage || heroImage}
        canonicalPath={product.canonicalUrl || `/products/${product.slug}`}
        keywords={product.seoKeywords || []}
        robots={product.metaRobots}
        type="product"
        jsonLd={[productSchema(product), breadcrumbSchema(breadcrumbs)]}
      />

      <section className="product-detail__hero section">
        <div className="product-detail__inner container-xl">
          <div>
            <Breadcrumbs items={breadcrumbs} />
            <span className="eyebrow">{product.category?.name || 'Eco Packaging'}</span>
            <h1>{product.name}</h1>
            <p>{product.shortDescription || product.description}</p>
            <div className="product-detail__actions">
              <Link to="/request-quote" className="btn btn-primary">
                Request Quote
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="product-detail__media">
            {heroImage ? (
              <OptimizedImage src={heroImage} alt={product.name} sizes="(max-width: 900px) 100vw, 48vw" />
            ) : (
              <div className="product-detail__placeholder">{product.name}</div>
            )}
          </div>
        </div>
      </section>

      <section className="product-detail__specs section">
        <div className="container-xl">
          <div className="product-detail__spec-grid">
            <article>
              <h2>Product Details</h2>
              <p>{product.description}</p>
            </article>
            <dl>
              {product.material && (
                <>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </>
              )}
              {product.sizes?.length > 0 && (
                <>
                  <dt>Sizes</dt>
                  <dd>{product.sizes.join(', ')}</dd>
                </>
              )}
              {product.capacity && (
                <>
                  <dt>Capacity</dt>
                  <dd>{product.capacity}</dd>
                </>
              )}
              {product.moq && (
                <>
                  <dt>MOQ</dt>
                  <dd>{product.moq}</dd>
                </>
              )}
              {product.usage && (
                <>
                  <dt>Usage</dt>
                  <dd>{product.usage}</dd>
                </>
              )}
              {product.options && (
                <>
                  <dt>Options</dt>
                  <dd>{product.options}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </section>

      {product.specifications?.length > 0 && (
        <section className="product-detail__table-section section">
          <div className="container-xl">
            <span className="eyebrow">Catalogue Specifications</span>
            <h2>Sizes, material grade, dimensions, and packing</h2>
            <div className="product-detail__table-wrap">
              <table className="product-detail__table">
                <thead>
                  <tr>
                    <th>Product Size</th>
                    <th>GSM / Micron</th>
                    <th>Dimensions</th>
                    <th>Qty Per Box Packing</th>
                  </tr>
                </thead>
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr key={`${spec.size}-${spec.dimensions}-${spec.packing}`}>
                      <td>{spec.size}</td>
                      <td>{spec.gsm}</td>
                      <td>{spec.dimensions}</td>
                      <td>{spec.packing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {product.products?.length > 0 && (
        <section className="product-detail__variants section">
          <div className="container-xl">
            <span className="eyebrow">Available Products</span>
            <h2>{product.title || product.name} Types</h2>
            <div className="product-detail__variant-grid">
              {product.products.map((variant) => (
                <article className="product-detail__variant-card" id={getVariantId(variant)} key={variant}>
                  <h3>{variant}</h3>
                  <p>
                    Available for B2B buyers with bulk order support, food-grade material
                    options, and export-ready supply.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetailPage;
