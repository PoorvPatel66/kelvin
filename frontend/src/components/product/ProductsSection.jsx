import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import OptimizedImage from '../common/OptimizedImage.jsx';
import Skeleton from '../common/Skeleton.jsx';
import { fetchProducts } from '../../services/productService.js';
import './ProductsSection.css';

const fallbackProducts = [
  {
    _id: 'paper-cups',
    title: 'Paper Cups',
    slug: 'paper-cups',
    description: 'Premium hot and cold paper cups for cafes, coffee chains, and distributors.',
    image: null
  },
  {
    _id: 'paper-containers',
    title: 'Paper Containers',
    slug: 'paper-containers',
    description: 'Durable takeaway containers designed for secure food delivery and export supply.',
    image: null
  },
  {
    _id: 'pizza-boxes',
    title: 'Pizza Boxes',
    slug: 'pizza-boxes',
    description: 'Strong corrugated pizza boxes with clean finishing and custom branding options.',
    image: null
  },
  {
    _id: 'salad-bowls',
    title: 'Salad Bowls',
    slug: 'salad-bowls',
    description: 'Modern paper bowls for salads, meals, sides, and premium food presentation.',
    image: null
  },
  {
    _id: 'meal-boxes',
    title: 'Meal Boxes',
    slug: 'meal-boxes',
    description: 'Export-ready meal boxes for restaurants, cloud kitchens, and food businesses.',
    image: null
  },
  {
    _id: 'custom-printing',
    title: 'Custom Printing',
    slug: 'custom-printing',
    description: 'Private label packaging with brand colors, logos, and product-specific artwork.',
    image: null
  }
];

function getProductsFromResponse(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.products)) {
    return responseData.products;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
}

function getProductImage(product) {
  if (typeof product.image === 'string') {
    return product.image;
  }

  if (Array.isArray(product.images) && product.images[0]) {
    return product.images[0].url || product.images[0];
  }

  return null;
}

function ProductsSection() {
  const [products, setProducts] = useState(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await fetchProducts({
          search: search || undefined,
          featured: featured || undefined,
          page,
          limit: 6
        });
        const apiProducts = getProductsFromResponse(data);

        if (isMounted && apiProducts.length > 0) {
          setProducts(apiProducts);
          setTotalPages(data.totalPages || 1);
          setIsFallback(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsFallback(true);
        }
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
  }, [featured, page, search]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleFeaturedChange(event) {
    setFeatured(event.target.value);
    setPage(1);
  }

  return (
    <section className="products-section section" id="products">
      <div className="container-xl">
        <div className="products-section__header">
          <div>
            <span className="eyebrow">Product Range</span>
            <h2>Eco packaging built for modern food businesses</h2>
          </div>
          <p>
            Explore high-quality packaging categories made for importers, distributors,
            restaurants, coffee chains, and growing food brands.
          </p>
        </div>

        <div className="products-toolbar">
          <input
            className="input"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search products"
            aria-label="Search products"
          />
          <select className="select" value={featured} onChange={handleFeaturedChange} aria-label="Filter products">
            <option value="">All Products</option>
            <option value="true">Featured Only</option>
            <option value="false">Non Featured</option>
          </select>
        </div>

        {isLoading && <Skeleton rows={4} />}
        {isFallback && !isLoading && (
          <p className="products-section__status">
            Showing featured categories while live product data is being prepared.
          </p>
        )}

        <div className="products-grid" aria-busy={isLoading}>
          {products.map((product, index) => {
            const title = product.title || product.name;
            const slug = product.slug || product._id;
            const description = product.description || product.shortDescription;
            const image = getProductImage(product);

            return (
              <motion.article
                className="product-list-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.55 }}
                viewport={{ once: true, amount: 0.2 }}
                key={product._id || slug || title}
              >
                <Link to={`/products/${slug}`} className="product-list-card__media" aria-label={`View ${title}`}>
                  {image ? (
                    <OptimizedImage src={image} alt={title} sizes="(max-width: 640px) 100vw, 33vw" />
                  ) : (
                    <div className={`product-list-card__placeholder product-list-card__placeholder--${index % 4}`}>
                      <span>{title}</span>
                    </div>
                  )}
                </Link>

                <div className="product-list-card__content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link to={`/products/${slug}`} className="product-list-card__link">
                    View Details
                    <FaArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        {!isFallback && totalPages > 1 && (
          <div className="products-pagination">
            <button className="btn btn-outline" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-outline"
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductsSection;
