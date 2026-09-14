import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO.jsx';
import { siteImages } from '../../data/siteImages.js';
import './InfoPages.css';

const services = [
  {
    title: 'Logo Printing',
    text: 'Print your logo clearly on cups, bowls, boxes, sleeves, and food containers.'
  },
  {
    title: 'Private Label Packaging',
    text: 'Create packaging that matches your brand colors, market positioning, and buyer needs.'
  },
  {
    title: 'Size And Material Guidance',
    text: 'Choose suitable formats based on food type, delivery use, storage, and serving style.'
  }
];

const customizationProducts = [
  { title: 'Printed Paper Cups', image: siteImages.customization.cupDesign },
  { title: 'Double Wall Cups', image: siteImages.customization.doubleWallCupDesign },
  { title: 'Kraft Containers', image: siteImages.customization.kraftContainerDesign },
  { title: 'Containers With Paper Lid', image: siteImages.customization.paperLidContainerDesign },
  { title: 'Meal Boxes', image: siteImages.customization.mealBoxDesign },
  { title: 'Pizza Boxes', image: siteImages.customization.pizzaBoxDesign },
  { title: 'Tea Flasks', image: siteImages.customization.teaFlaskDesign },
  { title: 'Big Containers', image: siteImages.customization.bigContainerDesign }
];

function CustomizationPage() {
  return (
    <main>
      <SEO
        title="Customization"
        description="Custom printed eco-friendly packaging for food brands, restaurants, importers, distributors, coffee chains, and private-label packaging buyers."
        canonicalPath="/customization"
      />
      <section className="page-hero">
        <div className="page-hero__inner container-xl">
          <span className="eyebrow">Custom Printing</span>
          <h1>Packaging that carries your brand into every customer order.</h1>
          <p>
            From simple logo placement to full private-label packaging, we help food businesses
            turn practical packaging into a consistent brand experience.
          </p>
        </div>
      </section>

      <section className="page-band page-band--muted">
        <div className="content-grid container-xl">
          {services.map((service) => (
            <article className="content-card" key={service.title}>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-band customization-products">
        <div className="container-xl">
          <div className="page-section-head">
            <span className="eyebrow">Custom Product Gallery</span>
            <h2>Printing options for your packaging line.</h2>
            <p>
              Browse custom printed cups, containers, boxes, flasks, and food packaging formats
              prepared for brand-focused food businesses.
            </p>
          </div>

          <div className="customization-gallery">
            {customizationProducts.map((product) => (
              <article className="customization-gallery__card" key={product.title}>
                <img src={product.image} alt={product.title} loading="lazy" />
                <h3>{product.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-band">
        <div className="split-panel container-xl">
          <div>
            <h2>What to send for custom packaging</h2>
            <ul className="check-list">
              <li>Product type and size requirement.</li>
              <li>Estimated quantity or monthly demand.</li>
              <li>Logo or artwork file if available.</li>
              <li>Destination country and delivery expectations.</li>
            </ul>
          </div>
          <aside className="page-cta-card">
            <h2>Start custom printing</h2>
            <p>Send your artwork or requirement and our team will guide the next step.</p>
            <Link to="/request-quote" className="btn btn-outline">
              Request Quote
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default CustomizationPage;
