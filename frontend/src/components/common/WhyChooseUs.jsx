import {
  FaBoxes,
  FaIndustry,
  FaLeaf,
  FaPaintBrush,
  FaShippingFast,
  FaStopwatch
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import './WhyChooseUs.css';

const features = [
  {
    title: 'Fast Production',
    description: 'Streamlined production workflows help fulfill urgent and recurring packaging orders.',
    icon: FaStopwatch
  },
  {
    title: 'Export Ready',
    description: 'Packaging solutions prepared for international buyers, distributors, and bulk shipments.',
    icon: FaShippingFast
  },
  {
    title: 'Eco Materials',
    description: 'Sustainable paper-based materials selected for responsible food packaging applications.',
    icon: FaLeaf
  },
  {
    title: 'Custom Printing',
    description: 'Brand-ready printing support for logos, colors, private labels, and campaign packaging.',
    icon: FaPaintBrush
  },
  {
    title: 'Manufacturer',
    description: 'Direct manufacturing capability gives better quality control, pricing, and supply reliability.',
    icon: FaIndustry
  },
  {
    title: 'Bulk Support',
    description: 'Reliable support for high-volume orders from chains, importers, and distribution partners.',
    icon: FaBoxes
  }
];

function WhyChooseUs() {
  return (
    <section className="why-section section">
      <div className="container-xl">
        <div className="why-section__header text-center">
          <span className="eyebrow">B2B Packaging Advantage</span>
          <h2>Built for serious food packaging buyers</h2>
          <p>
            Kelvin Eco Products combines manufacturing strength, export readiness, and custom
            packaging support for growing food businesses.
          </p>
        </div>

        <div className="why-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className="why-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                viewport={{ once: true, amount: 0.25 }}
                key={feature.title}
              >
                <span className="why-card__icon">
                  <Icon aria-hidden="true" />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
