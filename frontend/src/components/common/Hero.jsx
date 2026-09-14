import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { siteImages } from '../../data/siteImages.js';
import './Hero.css';

const highlights = [
  'Eco-friendly food packaging for global buyers',
  'Custom printed cups, boxes, bowls, and containers',
  'Reliable bulk supply for importers and distributors'
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner container-xl">
        <div className="hero__content animate-fade-up">
          <span className="eyebrow">Eco Packaging Manufacturer and Exporter</span>
          <h1 className="hero__title">
            Think Green
            <span>Pack Smart</span>
          </h1>
          <p className="hero__subtitle">
            Premium sustainable packaging solutions for restaurants, coffee chains, food
            businesses, importers, and distribution partners.
          </p>

          <ul className="hero__points">
            {highlights.map((item) => (
              <li key={item}>
                <FaCheckCircle aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="hero__actions">
            <Link to="/request-quote" className="btn btn-primary btn-lg">
              Request Quote
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              View Products
            </Link>
          </div>
        </div>

        <div className="hero__visual" aria-label="Eco-friendly packaging products">
          <div className="hero__leaf hero__leaf--one" />
          <div className="hero__leaf hero__leaf--two" />
          <div className="hero__leaf hero__leaf--three" />

          <div className="hero__image-stage">
            <img src={siteImages.home.heroPackaging} alt="Kelvin eco-friendly packaging products" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
