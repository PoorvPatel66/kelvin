import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuArrowDown,
  LuArrowRight,
  LuBadgeCheck,
  LuBoxes,
  LuCircleCheck,
  LuClipboardList,
  LuGlobe,
  LuHandshake,
  LuLeaf,
  LuPackageCheck,
  LuPrinter,
  LuShieldCheck,
  LuTruck
} from 'react-icons/lu';
import SEO from '../../components/seo/SEO.jsx';
import { siteImages } from '../../data/siteImages.js';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import styles from './AboutPage.module.css';

const reveal = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } }
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.06, clipPath: 'inset(12% 0 12% 0)' },
  visible: {
    opacity: 1,
    scale: 1,
    clipPath: 'inset(0% 0 0% 0)',
    transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
  }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const viewport = { once: true, amount: 0.18 };

const focusItems = [
  { label: 'B2B Focus', icon: LuHandshake },
  { label: 'Bulk Supply', icon: LuBoxes },
  { label: 'Custom Branding', icon: LuPrinter },
  { label: 'Export Ready', icon: LuGlobe }
];

const journey = [
  {
    year: '2021',
    label: 'Idea',
    text: 'A clear vision for responsible food packaging began with product research and market understanding.'
  },
  {
    year: '2022',
    label: 'Foundation',
    text: 'Kelvin Eco Products started building around quality, service, and practical food packaging needs.'
  },
  {
    year: '2023',
    label: 'Product Expansion',
    text: 'The range grew across cups, containers, bowls, meal boxes, pizza boxes, flasks, lids, and pouches.'
  },
  {
    year: '2024',
    label: 'Growing Customer Base',
    text: 'Restaurants, wholesalers, distributors, and food brands became part of the Kelvin supply story.'
  },
  {
    year: '2025',
    label: 'Wider Market Reach',
    text: 'The team strengthened customization, repeat supply support, and export-focused communication.'
  },
  {
    year: '2026',
    label: 'Growing for the Future',
    text: 'Kelvin continues to build for responsible growth, better packaging choices, and global buyer readiness.'
  }
];

const drivers = [
  {
    number: '01',
    title: 'Mission',
    text: 'Deliver reliable, high-quality, and sustainable packaging solutions that help businesses package smarter.',
    icon: LuPackageCheck
  },
  {
    number: '02',
    title: 'Vision',
    text: 'Build Kelvin Eco Products into a trusted packaging partner for businesses across global markets.',
    icon: LuGlobe
  },
  {
    number: '03',
    title: 'Values',
    text: 'Quality, sustainability, innovation, reliability, and customer commitment guide every packaging decision.',
    icon: LuBadgeCheck
  }
];

const benefits = [
  {
    number: '01',
    title: 'Premium Quality Standards',
    text: 'We focus on food-grade raw materials, durable construction, clean finishing, and consistent product performance for restaurants, cafes, distributors, and repeat bulk orders.',
    icon: LuShieldCheck,
    size: 'large'
  },
  {
    number: '02',
    title: 'Eco-Friendly Packaging',
    text: 'Our paper-based and responsible packaging options help food businesses reduce plastic dependence while maintaining hygiene, presentation, and everyday usability.',
    icon: LuLeaf
  },
  {
    number: '03',
    title: 'Wide Product Range',
    text: 'From paper cups, ripple cups, containers, salad bowls, meal boxes, pizza boxes, tea flasks, lids, pouches, and custom printed packaging, buyers can source more under one roof.',
    icon: LuBoxes
  },
  {
    number: '04',
    title: 'Customization & Branding',
    text: 'We support logo printing, color direction, size planning, artwork guidance, and branded packaging presentation so every takeaway order carries your business identity.',
    icon: LuPrinter,
    image: siteImages.products.customPrinting
  },
  {
    number: '05',
    title: 'Competitive Pricing',
    text: 'Our pricing approach balances premium product quality with practical cost control, helping small food brands, chains, distributors, and importers plan sustainable purchasing.',
    icon: LuCircleCheck
  },
  {
    number: '06',
    title: 'Reliable Bulk Supply',
    text: 'Built for volume requirements, repeat supply, and category planning, our product range supports restaurants, coffee chains, wholesalers, distributors, and export buyers.',
    icon: LuTruck
  },
  {
    number: '07',
    title: 'Timely Delivery',
    text: 'We keep communication clear from inquiry to dispatch, helping buyers coordinate quantities, product selection, packing expectations, and delivery timelines with confidence.',
    icon: LuClipboardList
  },
  {
    number: '08',
    title: 'Export Support',
    text: 'For international and wholesale buyers, we provide export-minded support around product details, packaging requirements, documentation readiness, and long-term supply coordination.',
    icon: LuGlobe,
    size: 'wide'
  }
];

const process = [
  ['01', 'Requirement', 'Understand product type, size, quantity, destination, and printing needs.'],
  ['02', 'Product Selection', 'Match the application with cups, bowls, boxes, containers, lids, or pouches.'],
  ['03', 'Customization', 'Prepare logo, print direction, material preference, and brand presentation.'],
  ['04', 'Production', 'Manufacture with food-service practicality and repeat-supply consistency.'],
  ['05', 'Quality Check', 'Review finish, usability, packing needs, and order readiness.'],
  ['06', 'Packaging', 'Pack products for safe handling, storage, dispatch, and bulk movement.'],
  ['07', 'Dispatch', 'Coordinate delivery communication for local and export-oriented buyers.']
];

function AboutPage() {
  const cmsPage = usePublishedPage('about');
  const hero = getCmsSection(cmsPage, 'hero', {
    eyebrow: '01 / About Kelvin Eco Products',
    heading: 'Packaging with',
    accent: 'Purpose.',
    description: 'Creating reliable, sustainable, and thoughtfully designed packaging solutions for businesses that care about quality, performance, and the planet.'
  });
  const whoWeAre = getCmsSection(cmsPage, 'whoWeAre', {
    heading: 'Packaging Built for Modern Businesses.',
    description: 'Kelvin Eco Products is a B2B eco-friendly packaging manufacturer focused on helping restaurants, cafes, coffee chains, distributors, importers, and food brands package products with confidence. We supply paper cups, containers, pizza boxes, salad bowls, tea flasks, lids, meal boxes, spout pouches, and custom printed packaging.'
  });
  const story = getCmsSection(cmsPage, 'story', {
    heading: 'From an Idea to a Growing Packaging Brand.',
    paragraphOne: 'Kelvin Eco Products was shaped around a practical business need: food packaging should be dependable, brand-ready, and more responsible.',
    paragraphTwo: 'Today, our direction remains clear. We focus on food-grade quality, modern product presentation, repeat bulk supply, and packaging solutions that help businesses choose better materials.',
    quote: 'Think Green. Pack Smart.'
  });
  const mission = getCmsSection(cmsPage, 'mission', drivers[0].text);
  const vision = getCmsSection(cmsPage, 'vision', drivers[1].text);
  const aboutDrivers = drivers.map((item) => item.title === 'Mission'
    ? { ...item, text: typeof mission === 'string' ? mission : mission.text || item.text }
    : item.title === 'Vision'
      ? { ...item, text: typeof vision === 'string' ? vision : vision.text || item.text }
      : item);
  const seo = getCmsSeo(cmsPage, {
    title: 'About Kelvin Eco Products',
    description: 'Kelvin Eco Products manufactures eco-friendly food packaging for restaurants, distributors, importers, and global food businesses.',
    canonicalPath: '/about'
  });

  return (
    <main className={styles.aboutPage}>
      <SEO
        {...seo}
      />

      <section className={styles.hero} aria-labelledby="about-hero-title">
        <div className={styles.heroFrame}>
          <motion.div className={styles.heroCopy} initial="hidden" animate="visible" variants={stagger}>
            <motion.span className={styles.eyebrow} variants={reveal}>
              {hero.eyebrow}
            </motion.span>
            <motion.h1 id="about-hero-title" variants={reveal}>
              {hero.heading} <span>{hero.accent}</span>
            </motion.h1>
            <motion.p variants={reveal}>
              {hero.description}
            </motion.p>
            <motion.div className={styles.heroAction} variants={reveal}>
              <a href="#who-we-are">
                Discover Our Story
                <LuArrowDown aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>

          <motion.div className={styles.heroImageWrap} initial="hidden" animate="visible" variants={imageReveal}>
            <img src="/images/home/company.png" alt="Kelvin Eco Products manufacturing facility" />
          </motion.div>
          <span className={styles.sectionNumber} aria-hidden="true">
            01
          </span>
        </div>
      </section>

      <section className={styles.who} id="who-we-are" aria-labelledby="who-title">
        <div className={styles.container}>
          <motion.div className={styles.whoGrid} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <motion.div className={styles.whoImage} variants={imageReveal}>
              <span aria-hidden="true">WHO WE ARE</span>
              <img src={siteImages.home.heroPackaging} alt="Kelvin eco-friendly packaging product range" loading="lazy" />
            </motion.div>

            <motion.article className={styles.glassPanel} variants={reveal}>
              <span className={styles.eyebrow}>02 / Who We Are</span>
              <h2 id="who-title">{whoWeAre.heading}</h2>
              <p>{whoWeAre.description}</p>
              <div className={styles.focusList}>
                {focusItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <span key={item.label}>
                      <Icon aria-hidden="true" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </motion.article>
          </motion.div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="story-title">
        <div className={styles.container}>
          <span className={styles.backgroundWord} aria-hidden="true">
            OUR STORY
          </span>
          <motion.div className={styles.storyGrid} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <motion.div className={styles.storyCopy} variants={reveal}>
              <span className={styles.eyebrow}>03 / Our Story</span>
              <h2 id="story-title">
                {story.heading}
              </h2>
              <p>
                {story.paragraphOne}
              </p>
              <p>
                {story.paragraphTwo}
              </p>
              <blockquote>{story.quote}</blockquote>
            </motion.div>

            <motion.div className={styles.storyImages} variants={stagger}>
              <motion.img variants={imageReveal} src={siteImages.products.paperCups} alt="Paper cup packaging products" loading="lazy" />
              <motion.img variants={imageReveal} src={siteImages.home.factory} alt="Kelvin packaging factory" loading="lazy" />
            </motion.div>
          </motion.div>
          <span className={styles.bigNumber} aria-hidden="true">
            03
          </span>
        </div>
      </section>

      <section className={styles.journeySection} aria-labelledby="journey-title">
        <div className={styles.container}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={viewport} variants={reveal}>
            <span className={styles.eyebrow}>04 / Our Journey</span>
            <h2 id="journey-title">
              Our <span>Journey</span>
            </h2>
            <p>From an idea to a growing packaging partner.</p>
          </motion.div>

          <motion.div className={styles.journey} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            {journey.map((item) => (
              <motion.article className={styles.journeyItem} variants={reveal} key={item.year}>
                <span className={styles.journeyYear}>{item.year}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.drivers} aria-labelledby="drivers-title">
        <div className={styles.container}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={viewport} variants={reveal}>
            <span className={styles.eyebrow}>05 / Mission Vision Values</span>
            <h2 id="drivers-title">
              What <span>Drives Us</span>
            </h2>
          </motion.div>

          <motion.div className={styles.driverGrid} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            {aboutDrivers.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article variants={reveal} whileHover={{ y: -8 }} key={item.title}>
                  <b aria-hidden="true">{item.number}</b>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className={styles.why} aria-labelledby="why-title">
        <div className={styles.container}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={viewport} variants={reveal}>
            <span className={styles.eyebrow}>06 / Why Choose Kelvin</span>
            <h2 id="why-title">
              Why <span>Kelvin?</span>
            </h2>
          </motion.div>

          <motion.div className={styles.bento} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article
                  variants={reveal}
                  whileHover={{ y: -6 }}
                  className={`${styles.bentoCard} ${item.size ? styles[item.size] : ''}`}
                  key={item.title}
                >
                  {item.image && <img src={item.image} alt="" aria-hidden="true" loading="lazy" />}
                  <span>{item.number}</span>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <LuArrowRight className={styles.cardArrow} aria-hidden="true" />
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.container}>
          <motion.div className={styles.processIntro} initial="hidden" whileInView="visible" viewport={viewport} variants={reveal}>
            <span className={styles.eyebrow}>07 / How We Work</span>
            <h2 id="process-title">
              From Requirement <span>to Delivery.</span>
            </h2>
          </motion.div>

          <motion.ol className={styles.processList} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            {process.map(([number, title, text]) => (
              <motion.li variants={reveal} key={title}>
                <strong>{number}</strong>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      <section className={styles.global} aria-labelledby="global-title">
        <div className={styles.container}>
          <motion.div className={styles.globalGrid} initial="hidden" whileInView="visible" viewport={viewport} variants={stagger}>
            <motion.div variants={reveal}>
              <span className={styles.eyebrow}>08 / Global Reach</span>
              <h2 id="global-title">
                Packaging Beyond <span>Borders.</span>
              </h2>
              <p>
                Kelvin Eco Products is India-based with a global outlook. We support B2B buyers
                with clear communication, export-ready thinking, and product planning for modern
                food packaging needs.
              </p>
            </motion.div>
            <motion.div className={styles.mapPanel} variants={imageReveal}>
              <img src="/images/home/export-map.png" alt="World map representing Kelvin Eco Products global outlook" loading="lazy" />
              <span className={styles.mapPin} aria-hidden="true">
                India / Home Base
              </span>
              <span className={styles.mapTag}>B2B Focus</span>
              <span className={styles.mapTag}>Export Ready</span>
              <span className={styles.mapTag}>Global Outlook</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <div className={styles.finalImage} aria-hidden="true">
          <img src={siteImages.home.factory} alt="" loading="lazy" />
        </div>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={reveal}>
            <span className={styles.eyebrow}>09 / Work With Kelvin</span>
            <h2 id="cta-title">
              Let's Package a <span>Better Tomorrow.</span>
            </h2>
            <p>Looking for a reliable packaging partner for your business?</p>
            <div className={styles.ctaActions}>
              <Link to="/request-quote">
                Request a Quote
                <LuArrowRight aria-hidden="true" />
              </Link>
              <Link to="/products">
                Explore Products
                <LuArrowRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
