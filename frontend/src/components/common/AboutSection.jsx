import { Link } from 'react-router-dom';
import { siteImages } from '../../data/siteImages.js';
import './AboutSection.css';

function LeafAccent() {
  return (
    <svg className="about-section__leaf" viewBox="0 0 120 120" role="img" aria-label="Leaf accent">
      <path
        d="M101 17C62 20 29 39 17 73c22 9 55 4 75-18 11-12 14-26 9-38Z"
        fill="currentColor"
      />
      <path
        d="M25 79c20-25 43-39 72-55"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <path
        d="M44 62c5 1 12 1 18-1M59 50c6 1 13 0 19-3"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function AboutSection() {
  return (
    <section className="about-section section" id="about">
      <div className="about-section__inner container-xl">
        <div className="about-section__media" aria-label="Kelvin Eco Products factory illustration">
          <div className="factory-visual">
            <LeafAccent />
            <img src={siteImages.home.factory} alt="Kelvin Eco Products factory" loading="lazy" />
          </div>
        </div>

        <div className="about-section__content">
          <span className="eyebrow">About Kelvin Eco Products</span>
          <h2>Manufacturing eco-friendly packaging for growing global food brands</h2>
          <p>
            Kelvin Eco Products is focused on reliable, scalable, and responsibly made food
            packaging for B2B buyers. From paper cups and containers to pizza boxes, salad
            bowls, meal boxes, and custom printed packaging, we support businesses that need
            consistent quality and dependable supply.
          </p>
          <p>
            Our approach combines clean manufacturing practices, export-focused operations,
            and brand-ready customization so importers, distributors, restaurants, and coffee
            chains can source packaging with confidence.
          </p>

          <div className="about-section__stats">
            <div>
              <strong>8+</strong>
              <span>Product Categories</span>
            </div>
            <div>
              <strong>B2B</strong>
              <span>Bulk Supply Focus</span>
            </div>
            <div>
              <strong>Eco</strong>
              <span>Material First</span>
            </div>
          </div>

          <Link to="/about" className="btn btn-secondary btn-lg">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
