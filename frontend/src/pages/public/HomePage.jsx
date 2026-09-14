import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuArrowRight,
  LuCircleCheck,
  LuGlobe,
  LuLeaf,
  LuPhone,
  LuPackage,
  LuRecycle,
  LuShieldCheck,
  LuStar,
  LuUsers
} from 'react-icons/lu';
import SEO from '../../components/seo/SEO.jsx';
import { siteImages } from '../../data/siteImages.js';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { productCatalog } from '../../data/productCatalog.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import { fetchTestimonials } from '../../services/testimonialService.js';
import { fetchProducts } from '../../services/productService.js';
import { fetchExportCountries } from '../../services/exportCountryService.js';
import { normalizeProductForDisplay } from '../../utils/productDisplay.js';
import './HomePage.css';

const MotionLink = motion.create(Link);

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } }
};

const inView = { once: true, amount: 0.18 };

const heroChips = [
  { label: 'Food Grade', icon: LuShieldCheck },
  { label: 'Export Ready', icon: LuGlobe },
  { label: 'Custom Printed', icon: LuPackage },
  { label: 'Bulk Supply', icon: LuUsers }
];

const uspCards = [
  { title: 'Eco Friendly', text: 'Sustainable packaging solutions', icon: LuLeaf },
  { title: 'Premium Quality', text: 'High quality assurance', icon: LuShieldCheck },
  { title: 'Global Reach', text: 'Exporting to multiple countries', icon: LuGlobe },
  { title: 'Safe Packaging', text: 'Hygienic and food grade materials', icon: LuPackage },
  { title: 'Biodegradable', text: 'Better for planet Earth', icon: LuRecycle }
];

const fallbackHomeProducts = [
  { title: 'Single Wall Paper Cup', slug: 'single-wall-paper-cup', image: siteImages.products.singleWallPaperCup },
  { title: 'Ripple Wall Paper Cup', slug: 'ripple-wall-paper-cup', image: siteImages.products.rippleWallPaperCup },
  { title: 'Paper Container with Paper Lid', slug: 'paper-container-with-paper-lid', image: siteImages.products.containerWithLid },
  { title: 'Salad Bowl with PET Lid', slug: 'salad-bowl-with-pet-lid', image: siteImages.products.saladBowlWithPetLid },
  { title: 'Silver/Transparent Spout Pouch', slug: 'silver-transparent-spout-pouch', image: siteImages.products.silverTransparentSpoutPouch },
  { title: 'Pizza Box', slug: 'pizza-box', image: siteImages.products.pizzaBox }
];

const stats = [
  { value: '5+', label: 'Years of Experience', icon: LuStar },
  { value: '2500+', label: 'Happy Clients', icon: LuUsers },
  { value: '10+', label: 'Countries Exported', icon: LuGlobe },
  { value: '100%', label: 'Eco Friendly Products', icon: LuLeaf }
];

const homeIconMap = {
  leaf: LuLeaf,
  shield: LuShieldCheck,
  globe: LuGlobe,
  package: LuPackage,
  recycle: LuRecycle,
  users: LuUsers,
  star: LuStar
};

const fallbackExportCountries = [
  { name: 'UAE', flag: 'https://flagcdn.com/w80/ae.png', x: '58%', y: '50%' },
  { name: 'Saudi Arabia', flag: 'https://flagcdn.com/w80/sa.png', x: '55%', y: '53%' },
  { name: 'Oman', flag: 'https://flagcdn.com/w80/om.png', x: '61%', y: '55%' },
  { name: 'Qatar', flag: 'https://flagcdn.com/w80/qa.png', x: '59%', y: '52%' },
  { name: 'UK', flag: 'https://flagcdn.com/w80/gb.png', x: '47%', y: '36%' },
  { name: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', x: '27%', y: '36%' },
  { name: 'Australia', flag: 'https://flagcdn.com/w80/au.png', x: '79%', y: '76%' },
  { name: 'South Africa', flag: 'https://flagcdn.com/w80/za.png', x: '56%', y: '76%' },
  { name: 'India', flag: 'https://flagcdn.com/w80/in.png', x: '64%', y: '56%' }
];

const fallbackTestimonials = [
  {
    quote: 'Kelvin Eco Products has been our trusted partner for eco-friendly packaging. The quality and service are unmatched.',
    name: 'Ahmed Al Mansoori',
    role: 'Importer, UAE'
  },
  {
    quote: 'Excellent product quality, timely delivery, and professional support. Highly recommended for distributors.',
    name: 'Sarah Mitchell',
    role: 'Distributor, UK'
  },
  {
    quote: 'We love their sustainable approach and customized packaging solutions for our brand.',
    name: 'James Peterson',
    role: 'Restaurant Chain, Canada'
  }
];

const googleReviewUrl = 'https://www.google.com/search?sca_esv=76adef1170c75770&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_9Livsuc1nE1rUJjfWi2k4LDmMe5XhNzZMJOsMAAHndGTWw73AZziUUiN8Ru1fcOZDj5T3TLBIyAr8VpSU11rytt6ftcG1dQDf3GShoNTnMdYvB0CQ%3D%3D&q=Kelvin+Eco+Products+Reviews&sa=X&ved=2ahUKEwi6jpLjgJqVAxVtV0EAHYjDKJIQ0bkNegQIPRAH&biw=1920&bih=957&dpr=1';

function FloatingHeroImage() {
  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty('--float-x', `${x * 18}px`);
    event.currentTarget.style.setProperty('--float-y', `${y * 14}px`);
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty('--float-x', '0px');
    event.currentTarget.style.setProperty('--float-y', '0px');
  }

  return (
    <div className="home-hero__image-card" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <img src={siteImages.home.heroPackaging} alt="Kelvin premium eco packaging range" />
      <span className="home-leaf home-leaf--one" />
      <span className="home-leaf home-leaf--two" />
      <span className="home-leaf home-leaf--three" />
    </div>
  );
}

function HomePage() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [homeProducts, setHomeProducts] = useState(() =>
    productCatalog
      .map(normalizeProductForDisplay)
      .slice(0, 13)
      .map((product) => ({
        title: product.title,
        slug: product.slug,
        image: product.image
      }))
  );
  const [exportCountries, setExportCountries] = useState(fallbackExportCountries);
  const cmsPage = usePublishedPage('home');
  const hero = getCmsSection(cmsPage, 'hero', {
    eyebrow: 'Eco Packaging Manufacturer',
    heading: 'THINK GREEN',
    accent: 'PACK SMART',
    description: 'Premium Eco-Friendly Packaging Solutions For Global Businesses.'
  });
  const seo = getCmsSeo(cmsPage, {
    title: 'Premium Eco-Friendly Packaging Manufacturer and Exporter',
    description: 'Kelvin Eco Products manufactures premium eco-friendly packaging solutions for global food businesses, importers, distributors, restaurants, and coffee chains.',
    canonicalPath: '/'
  });
  const uspSection = getCmsSection(cmsPage, 'usp', { items: uspCards });
  const statsSection = getCmsSection(cmsPage, 'stats', { items: stats });
  const productsSection = getCmsSection(cmsPage, 'products', {
    eyebrow: 'Our Products',
    heading: 'Sustainable Packaging For Every Need'
  });
  const exportSection = getCmsSection(cmsPage, 'export', {
    eyebrow: 'Global Export Supply',
    heading: 'WE EXPORT TO',
    description: 'Serving importers, distributors, restaurants, and food businesses worldwide.',
    mapImage: '/images/home/export-map.png'
  });
  const whySection = getCmsSection(cmsPage, 'why', {
    eyebrow: 'Why Choose Us',
    heading: 'We Are Committed To',
    accent: 'Quality & Sustainability',
    description:
      'At Kelvin Eco Products, we combine innovation with responsibility to deliver packaging solutions that are good for your business and better for the planet.',
    bulletOne: 'Sustainable and renewable material focus',
    bulletTwo: 'Strict quality control',
    bulletThree: 'On-time delivery and reliable support'
  });
  const helpSection = getCmsSection(cmsPage, 'help', {
    heading: 'Quick responses',
    accent: 'and clear communication',
    buttonLabel: 'Contact Us'
  });
  const visibleHeroChips = Array.isArray(hero.chips) && hero.chips.length
    ? hero.chips.map((label) => ({
      label,
      icon: homeIconMap[
        label.toLowerCase().includes('food')
          ? 'shield'
          : label.toLowerCase().includes('export')
            ? 'globe'
            : label.toLowerCase().includes('custom')
              ? 'package'
              : label.toLowerCase().includes('bulk')
                ? 'users'
                : 'leaf'
      ] || LuLeaf
    }))
    : heroChips;
  const visibleUspCards = Array.isArray(uspSection.items) && uspSection.items.length
    ? uspSection.items.map((item) => ({
      ...item,
      icon: homeIconMap[item.icon] || LuLeaf
    }))
    : uspCards;
  const visibleStats = Array.isArray(statsSection.items) && statsSection.items.length
    ? statsSection.items.map((item) => ({
      ...item,
      icon: homeIconMap[item.icon] || LuStar
    }))
    : stats;

  useEffect(() => {
    let active = true;
    fetchTestimonials({ featured: true })
      .then((records) => {
        if (active && records.length) setTestimonials(records);
      })
      .catch(() => {
        if (active) setTestimonials(fallbackTestimonials);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    fetchProducts({ page: 1, limit: 100 })
      .then((response) => {
        if (!active) return;

        const liveProducts = (response?.products || [])
          .map(normalizeProductForDisplay)
          .filter((product) => product.slug && product.title)
          .map((product) => ({
            title: product.title,
            slug: product.slug,
            image: product.image
          }));

        if (liveProducts.length) {
          setHomeProducts(liveProducts);
        } else {
          setHomeProducts(fallbackHomeProducts);
        }
      })
      .catch(() => {
        if (active) setHomeProducts(fallbackHomeProducts);
      });

    fetchExportCountries()
      .then((countries) => {
        if (!active) return;

        const liveCountries = countries
          .filter((country) => country?.countryName && country?.flagUrl)
          .map((country) => ({
            name: country.countryName,
            flag: country.flagUrl
          }));

        setExportCountries(liveCountries.length ? liveCountries : fallbackExportCountries);
      })
      .catch(() => {
        if (active) setExportCountries(fallbackExportCountries);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="home-redesign">
      <SEO
        {...seo}
      />

      <motion.section className="home-hero" initial="hidden" animate="visible" variants={stagger}>
        <div className="home-container home-hero__grid">
          <motion.div className="home-hero__content" variants={reveal}>
            <span className="home-kicker">{hero.eyebrow}</span>
            <h1>
              {hero.heading}
              <span>{hero.accent}</span>
            </h1>
            <p>{hero.description}</p>

            <div className="home-hero__chips">
              {visibleHeroChips.map((chip) => {
                const Icon = chip.icon;

                return (
                  <span key={chip.label}>
                    <Icon aria-hidden="true" />
                    {chip.label}
                  </span>
                );
              })}
            </div>

            <div className="home-hero__actions">
              <Link to="/contact" className="home-btn home-btn--primary">
                Request Quote
                <LuArrowRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <FloatingHeroImage />
        </div>

        <svg className="home-hero__wave" viewBox="0 0 1440 130" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,88 C210,132 350,25 568,60 C794,96 960,126 1175,70 C1285,42 1368,46 1440,62 L1440,130 L0,130 Z" />
        </svg>
      </motion.section>

      <section className="home-usp" aria-label="Kelvin advantages">
        <div className="home-container">
          <motion.div className="home-usp__panel" variants={stagger} initial="hidden" whileInView="visible" viewport={inView}>
            {visibleUspCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.article className="home-usp__card" variants={reveal} key={card.title}>
                  <span>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="home-products home-section">
        <div className="home-container">
          <motion.div className="home-section-title" variants={reveal} initial="hidden" whileInView="visible" viewport={inView}>
            <span className="home-kicker home-kicker--center">{productsSection.eyebrow}</span>
            <h2>{productsSection.heading}</h2>
          </motion.div>

          <div className="home-product-marquee" aria-label="Featured product categories">
            <motion.div className="home-product-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={inView}>
              {[...homeProducts, ...homeProducts].map((product, index) => (
                <MotionLink
                  className="home-product-card"
                  to={`/products/${product.slug}`}
                  variants={reveal}
                  key={`${product.title}-${index}`}
                  aria-label={`View ${product.title} products`}
                >
                  <img src={product.image} alt={product.title} loading="lazy" />
                  <h3>{product.title}</h3>
                </MotionLink>
              ))}
            </motion.div>
          </div>

          <div className="home-products__action">
            <Link className="home-btn home-btn--primary" to="/products">
              View All Products
              <LuArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="Company statistics">
        <div className="home-container">
          <div className="home-stats__bar">
            {visibleStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article key={stat.label}>
                  <Icon aria-hidden="true" />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-export home-section" id="export">
        <div className="home-container">
          <motion.div className="home-section-title" variants={reveal} initial="hidden" whileInView="visible" viewport={inView}>
            <span className="home-kicker home-kicker--center">{exportSection.eyebrow}</span>
            <h2>{exportSection.heading}</h2>
            <p>{exportSection.description}</p>
          </motion.div>

          <div className="home-export__map" aria-label="Kelvin Eco Products global export supply map">
            <img
              src={exportSection.mapImage || '/images/home/export-map.png'}
              alt="Wooden world map showing Kelvin Eco Products global export supply"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="home-export__list-marquee" aria-label="Export country list">
            <div className="home-export__list-track">
              {[...exportCountries, ...exportCountries].map((country, index) => (
                <span className="home-export__list-item" key={`${country.name}-${index}`}>
                  <img src={country.flag} alt="" loading="lazy" aria-hidden="true" />
                  <strong>{country.name}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <motion.section className="home-why home-section" initial="hidden" whileInView="visible" viewport={inView} variants={stagger}>
        <div className="home-container home-why__grid">
          <motion.div className="home-why__content" variants={reveal}>
            <span className="home-kicker">{whySection.eyebrow}</span>
            <h2>
              {whySection.heading}
              <span>{whySection.accent}</span>
            </h2>
            <p>{whySection.description}</p>
            <ul>
              <li><LuCircleCheck aria-hidden="true" /> {whySection.bulletOne}</li>
              <li><LuCircleCheck aria-hidden="true" /> {whySection.bulletTwo}</li>
              <li><LuCircleCheck aria-hidden="true" /> {whySection.bulletThree}</li>
            </ul>
            <Link className="home-btn home-btn--primary" to="/about">
              Learn More About Us
              <LuArrowRight aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.div className="home-why__visual" variants={reveal}>
            <img src={siteImages.home.factory} alt="Sustainable eco packaging manufacturing" loading="lazy" />
            <div className="home-planet-card">
              <LuLeaf aria-hidden="true" />
              <strong>Better Packaging</strong>
              <span>Better Planet</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="home-testimonials home-section">
        <div className="home-container">
          <motion.div className="home-section-title" variants={reveal} initial="hidden" whileInView="visible" viewport={inView}>
            <h2>WHAT OUR CLIENTS SAY</h2>
          </motion.div>

          <div className="home-testimonial-marquee" aria-label="Client reviews">
            <div className="home-testimonial-track">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <motion.a
                  className="home-testimonial-card"
                  href={testimonial.sourceUrl || googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open Google reviews for Kelvin Eco Products. Review by ${testimonial.name}`}
                  whileHover={{ y: -7 }}
                  key={`${testimonial.name}-${index}`}
                >
                  <span>"</span>
                  <p>{testimonial.quote}</p>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <small>{testimonial.role}</small>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-help">
        <div className="home-container">
          <div className="home-help__panel">
            <div className="home-help__phone">
              <span>
                <LuPhone aria-hidden="true" />
              </span>
              <div>
                <small>Need help?</small>
                <strong>+91 9687 503514</strong>
              </div>
            </div>

            <h2>
              {helpSection.heading}
              <span>{helpSection.accent}</span>
            </h2>

            <Link className="home-help__button" to="/contact">
              {helpSection.buttonLabel}
              <LuArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default HomePage;
