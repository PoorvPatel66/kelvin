import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBoxOpen,
  FaEnvelope,
  FaGlobe,
  FaLeaf,
  FaLayerGroup,
  FaPaintBrush,
  FaPrint,
  FaRecycle,
  FaShieldAlt,
  FaTimes,
  FaUtensils,
  FaWhatsapp
} from 'react-icons/fa';
import SEO from '../../components/seo/SEO.jsx';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import { productCatalog } from '../../data/productCatalog.js';
import { siteImages } from '../../data/siteImages.js';
import { fetchProducts } from '../../services/productService.js';
import { normalizeProductForDisplay } from '../../utils/productDisplay.js';
import './ProductsPage.css';

const categoryHighlights = [
  { label: 'Food Grade', icon: FaShieldAlt },
  { label: 'Export Ready', icon: FaGlobe },
  { label: 'Eco Materials', icon: FaLeaf },
  { label: 'Custom Printing', icon: FaPaintBrush }
];

const productCategoryFilters = [
  { label: 'All Products', categories: [] },
  { label: 'Paper Cup', categories: ['Paper Cups'] },
  { label: 'Lid', categories: ['Plastic Lids', 'Eco Lids'] },
  { label: 'Paper Container', categories: ['Food Containers'] },
  { label: 'Salad Bowl', categories: ['Salad Bowls'] },
  { label: 'Meal Box', categories: ['Meal Boxes'] },
  { label: 'Food Box', categories: ['Food Boxes'] },
  { label: 'Pizza Box', categories: ['Pizza Boxes'] },
  { label: 'Tea Flask', categories: ['Tea Flasks'] },
  { label: 'Pouch', categories: ['Spout Pouches'] }
];

const customizationOptions = [
  {
    title: 'Logo Printing',
    text: 'Apply your brand logo on cups, containers, bowls, boxes, and takeaway packaging.',
    image: siteImages.customization.cupDesign
  },
  {
    title: 'Double Wall Cup Design',
    text: 'Create premium printed beverage cups with brand-ready artwork and clean finishing.',
    image: siteImages.customization.doubleWallCupDesign
  },
  {
    title: 'Kraft Container Design',
    text: 'Customize kraft containers for restaurants, takeaway counters, and delivery packaging.',
    image: siteImages.customization.kraftContainerDesign
  },
  {
    title: 'Paper Lid Container Design',
    text: 'Build matching printed container and lid systems for food-service buyers.',
    image: siteImages.customization.paperLidContainerDesign
  },
  {
    title: 'Meal Box Branding',
    text: 'Create buyer-ready meal box packaging ranges for cafes, distributors, and export programs.',
    image: siteImages.customization.mealBoxDesign
  },
  {
    title: 'Pizza Box Branding',
    text: 'Build pizza boxes, meal boxes, and food boxes with brand-focused presentation.',
    image: siteImages.customization.pizzaBoxDesign
  },
  {
    title: 'Printed Tea Flasks',
    text: 'Customize tea flasks and beverage packaging for bulk food-service supply.',
    image: siteImages.customization.teaFlaskDesign
  },
  {
    title: 'Bulk Container Branding',
    text: 'Develop larger branded packaging formats for high-volume food operations.',
    image: siteImages.customization.bigContainerDesign
  }
];

const colourSwatches = {
  White: '#ffffff',
  Kraft: '#b78342',
  Black: '#111827',
  'Brown Chess': '#8b5e34',
  Silver: '#d6d9de',
  Transparent: 'rgba(255,255,255,.55)',
  'Custom Print': 'linear-gradient(135deg, #0f2d52, #2e7d32 45%, #c9a227 70%, #e83f5b)',
  'Aluminum Foil': 'linear-gradient(135deg, #f4f7fb, #aab4c0 45%, #ffffff)'
};

const colourClassNames = {
  White: 'product-modal__colour-cup--white',
  Kraft: 'product-modal__colour-cup--kraft',
  Black: 'product-modal__colour-cup--black',
  'Brown Chess': 'product-modal__colour-cup--kraft',
  Silver: 'product-modal__colour-cup--silver',
  Transparent: 'product-modal__colour-cup--transparent',
  'Custom Print': 'product-modal__colour-cup--custom',
  'Aluminum Foil': 'product-modal__colour-cup--silver'
};

const formatSpecValue = (value) => {
  if (!value) return '-';

  return value
    .split(' / ')
    .map((part, index, items) => (items.length > 1 ? `> ${part.trim()}` : part.trim()))
    .join('\n');
};

const formatCapacityValue = (value) => {
  if (!value) return '-';
  return value.split(' / ').map((part) => part.trim()).join('\n');
};

const formatDimensionValue = (value) => {
  if (!value) return '-';
  return value.replace(/\s+x\s+/gi, ' X ');
};

const getDetailCards = (productItem) => [
  {
    label: 'Material',
    icon: FaLayerGroup,
    lines: [productItem.material]
  },
  {
    label: 'Printing Options',
    icon: FaPrint,
    lines: productItem.printing || [productItem.options]
  },
  {
    label: 'Usage',
    icon: FaUtensils,
    lines: [productItem.usage]
  },
  {
    label: 'Coating',
    icon: FaShieldAlt,
    lines: [productItem.coating]
  },
  {
    label: 'Features',
    icon: FaRecycle,
    lines: productItem.features || ['100% Recyclable']
  },
  {
    label: 'Packaging Details',
    icon: FaBoxOpen,
    lines: [productItem.packingDetails || productItem.moq]
  }
];

function ProductsPage() {
  const cmsPage = usePublishedPage('products');
  const customizeCmsPage = usePublishedPage('customize');
  const cmsHero = getCmsSection(cmsPage, 'hero', {
    eyebrow: 'Eco Packaging Catalogue',
    heading: 'Product range built for',
    accent: 'modern food businesses.',
    description: 'Explore paper cups, containers, bowls, boxes, lids, flasks, pouches, and export-ready food packaging made for B2B buyers.'
  });
  const cmsSeo = getCmsSeo(cmsPage, {
    title: 'Products',
    description: 'Explore Kelvin Eco Products packaging range including paper cups, containers, salad bowls, meal boxes, tea flasks, pizza boxes, lids, pouches, and custom printed packaging.',
    canonicalPath: '/products'
  });
  const customizeSection = getCmsSection(customizeCmsPage, 'hero', {
    eyebrow: 'Customize Packaging',
    heading: 'Make every package carry your brand.',
    description:
      'Add your logo, artwork, labels, colors, and export-ready brand details across cups, bowls, boxes, flasks, containers, lids, and takeaway packaging.'
  });
  const managedCustomizationOptions = customizeCmsPage?.sections?.customization?.items;
  const visibleCustomizationOptions = Array.isArray(managedCustomizationOptions) && managedCustomizationOptions.length
    ? managedCustomizationOptions.filter((item) => item?.title && item?.image)
    : customizationOptions;
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [catalogProducts, setCatalogProducts] = useState(() => productCatalog.map(normalizeProductForDisplay));

  const selectedFilter = productCategoryFilters.find((item) => item.label === activeCategory);
  const visibleProducts = selectedFilter?.categories.length
    ? catalogProducts.filter((product) => selectedFilter.categories.includes(product.category))
    : catalogProducts;

  useEffect(() => {
    let isCurrent = true;

    fetchProducts({ page: 1, limit: 100 })
      .then((response) => {
        if (isCurrent && Array.isArray(response?.products)) {
          setCatalogProducts(response.products.map(normalizeProductForDisplay));
        }
      })
      .catch(() => {
        // Local catalogue remains visible while the API is unavailable during deployment.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!activeProduct) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveProduct(null);
      }
    };

    document.body.style.overflow = 'hidden';
    document.body.classList.add('product-modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('product-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProduct]);

  return (
    <main className="products-page">
      <SEO
        {...cmsSeo}
      />

      <section className="products-hero">
        <div className="products-container products-hero__grid">
          <div className="products-hero__content">
            <span className="products-kicker">{cmsHero.eyebrow}</span>
            <h1>
              {cmsHero.heading}
              <span>{cmsHero.accent}</span>
            </h1>
            <p>{cmsHero.description}</p>
            <div className="products-hero__actions">
              {/* <Link to="/contact" className="products-btn products-btn--primary"> */}
                {/* Request Quote */}
                {/* <FaArrowRight aria-hidden="true" /> */}
              {/* </Link> */}
              {/* <a href="#product-catalogue" className="products-btn products-btn--outline">
                View Products
              </a> */}
            </div>
          </div>

          <div className="products-hero__visual" aria-label="Kelvin product packaging collection">
            <img src={siteImages.home.heroPackaging} alt="Kelvin eco packaging products" />
            <div className="products-hero__badge">
              <strong>{catalogProducts.length}</strong>
              <span>Catalogue items</span>
            </div>
          </div>
        </div>
      </section>

      <section className="products-feature-strip" aria-label="Product highlights">
        <div className="products-container products-feature-strip__grid">
          {categoryHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label}>
                <Icon aria-hidden="true" />
                <h2>{item.label}</h2>
              </article>
            );
          })}
        </div>
      </section>

      <section className="products-showcase" id="product-catalogue">
        <div className="products-container">
          <div className="products-section-heading">
            <span className="products-kicker">Our Products</span>
            <h2>Choose your packaging category</h2>
            <p>Tap any product to open complete sizes, specifications, dimensions, and packing details.</p>
          </div>

          <div className="products-category-pills" aria-label="Filter products by category">
            {productCategoryFilters.map((item) => {
              const isActive = activeCategory === item.label;

              return (
                <button
                  key={item.label}
                  className={`products-category-pill${isActive ? ' products-category-pill--active' : ''}`}
                  type="button"
                  onClick={() => setActiveCategory(item.label)}
                  aria-pressed={isActive}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="products-grid products-grid--image-only">
            {visibleProducts.map((product) => (
              <article className="product-card product-card--image-only" key={product.slug}>
                <button
                  className="product-card__image"
                  type="button"
                  onClick={() => setActiveProduct(product)}
                  aria-label={`View ${product.title} details`}
                >
                  <img src={product.image} alt={product.title} loading="lazy" />
                  <span>
                    <strong>{product.title}</strong>
                    View Details
                    <FaArrowRight aria-hidden="true" />
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="products-featured" id="customize" aria-labelledby="custom-packaging-title">
        <div className="products-container products-featured__panel products-featured__panel--customizer">
          <div className="products-featured__content">
            <span className="products-kicker">{customizeSection.eyebrow}</span>
            <h2 id="custom-packaging-title">{customizeSection.heading}</h2>
            <p>{customizeSection.description}</p>
            <div className="products-featured__tags" aria-label="Customization strengths">
              <span>Logo Printing</span>
              <span>Custom Sizes</span>
              <span>Bulk Branding</span>
            </div>
            <Link to="/request-quote" className="products-btn products-btn--primary">
              Request Custom Quote
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="products-featured__marquee" aria-label="Custom packaging examples">
            <div className="products-featured__track">
              {[...visibleCustomizationOptions, ...visibleCustomizationOptions].map((item, index) => (
                <Link
                  key={`${item.title}-${index}`}
                  to="/contact"
                  className="products-featured__tile"
                  aria-label={`Start inquiry for ${item.title}`}
                >
                  <img src={item.image} alt="" loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeProduct && (
        <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <button
            className="product-modal__backdrop"
            type="button"
            aria-label="Close product details"
            onClick={() => setActiveProduct(null)}
          />
          <div className="product-modal__panel product-modal__panel--catalogue">
            <button
              className="product-modal__close"
              type="button"
              aria-label="Close product details"
              onClick={() => setActiveProduct(null)}
            >
              <FaTimes aria-hidden="true" />
            </button>

            <div className="product-modal__gallery">
              <div className="product-modal__main-image">
                <img src={activeProduct.image} alt={activeProduct.title} />
              </div>

              <div className="product-modal__detail-cards" aria-label={`${activeProduct.title} product details`}>
                {getDetailCards(activeProduct).map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label}>
                      <Icon aria-hidden="true" />
                      <div>
                        <h3>{item.label}</h3>
                        <ul>
                          {item.lines.filter(Boolean).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="product-modal__quick-actions">
                <Link
                  to="/request-quote"
                  className="product-modal__quote"
                >
                  <FaEnvelope aria-hidden="true" />
                  <span>
                    <strong>Request Quote</strong>
                    <small>Get best price for bulk order</small>
                  </span>
                </Link>
                <a
                  className="product-modal__whatsapp"
                  href={`https://wa.me/919687503514?text=${encodeURIComponent(
                    `Hello Kelvin Eco Products, please send me details and pricing list for ${activeProduct.title}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaWhatsapp aria-hidden="true" />
                  <span>
                    <strong>WhatsApp Inquiry</strong>
                    <small>Chat with us on WhatsApp</small>
                  </span>
                </a>
              </div>

            </div>

            <div className="product-modal__content product-modal__content--catalogue">
              <h2 id="product-modal-title">{activeProduct.title}</h2>
              <div className="product-modal__leaf-rule" aria-hidden="true">
                <span />
                <FaLeaf />
                <span />
              </div>
              <p>{activeProduct.description || activeProduct.shortDescription}</p>

              {activeProduct.colours?.length > 0 && (
                <div className="product-modal__colours" aria-label="Available colours">
                  <h3>Available Colours</h3>
                  <div>
                    {activeProduct.colours.map((colour) => (
                      <span key={colour}>
                        <i
                          className={colourClassNames[colour] || 'product-modal__colour-cup--custom'}
                          style={{ '--colour-swatch': colourSwatches[colour] || '#e0ecde' }}
                          aria-hidden="true"
                        />
                        <strong>{colour}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeProduct.specifications?.length > 0 && (
                <div className="product-modal__table-wrap">
                  <table className="product-modal__table">
                    <caption>Size and specifications</caption>
                    <thead>
                      <tr>
                        <th>Capacity (Size)</th>
                        <th>GSM</th>
                        <th>Dimensions (T x B x H)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeProduct.specifications.map((row) => (
                        <tr key={`${row.size}-${row.dimensions}`}>
                          <td>{formatCapacityValue(row.size)}</td>
                          <td>{formatSpecValue(row.gsm)}</td>
                          <td>{formatDimensionValue(row.dimensions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductsPage;
