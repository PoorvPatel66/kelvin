import './ExportSection.css';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { fetchExportCountries } from '../../services/exportCountryService.js';

const fallbackCountries = [
  { name: 'UAE', flag: 'https://flagcdn.com/w80/ae.png' },
  { name: 'Saudi Arabia', flag: 'https://flagcdn.com/w80/sa.png' },
  { name: 'Oman', flag: 'https://flagcdn.com/w80/om.png' },
  { name: 'Qatar', flag: 'https://flagcdn.com/w80/qa.png' },
  { name: 'United Kingdom', flag: 'https://flagcdn.com/w80/gb.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w80/ca.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w80/au.png' },
  { name: 'South Africa', flag: 'https://flagcdn.com/w80/za.png' }
];

function ExportSection() {
  const [countries, setCountries] = useState(fallbackCountries);

  useEffect(() => {
    let isMounted = true;
    fetchExportCountries()
      .then((records) => {
        if (!isMounted || !records.length) return;
        setCountries(records.map((record) => ({
          name: record.countryName,
          flag: record.flagUrl
        })));
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="export-section" id="export">
      <div className="export-section__inner container-xl">
        <div className="export-section__title">
          <span className="export-section__leaf" />
          <div>
            <span className="eyebrow">Global Export Supply</span>
            <h2>We Export To</h2>
            <p>Serving importers, distributors, restaurants, and food businesses worldwide.</p>
          </div>
          <span className="export-section__leaf export-section__leaf--right" />
        </div>

        <div className="export-countries" aria-label="Countries Kelvin Eco Products exports to">
          {countries.map((country) => (
            <motion.article
              className="export-country"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.03 }}
              viewport={{ once: true, amount: 0.4 }}
              key={country.name}
            >
              <span className="export-country__logo">
                {country.flag
                  ? <img src={country.flag} alt={`${country.name} flag`} loading="lazy" />
                  : <span className="export-country__fallback" aria-hidden="true">{country.name.slice(0, 2).toUpperCase()}</span>}
              </span>
              <strong>{country.name}</strong>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExportSection;
