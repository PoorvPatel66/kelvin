import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO.jsx';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import { fetchCertifications } from '../../services/certificationService.js';
import './InfoPages.css';

const qualityPoints = [
  'Food-contact focused product selection and finishing.',
  'Consistent production checks for bulk and repeat orders.',
  'Packaging built for takeaway, delivery, retail, and export handling.',
  'Clear documentation support for B2B and distributor requirements.'
];

function QualityPage() {
  const [certifications, setCertifications] = useState([]);
  const cmsPage = usePublishedPage('quality');
  const hero = getCmsSection(cmsPage, 'hero', {
    eyebrow: 'Quality And Reliability',
    heading: 'Packaging quality that supports real food business operations.',
    description: 'B2B buyers need packaging that looks good, performs reliably, and arrives ready for use. Our quality approach is built around consistency, communication, and practical food-service requirements.'
  });
  const seo = getCmsSeo(cmsPage, {
    title: 'Quality',
    description: 'Kelvin Eco Products focuses on dependable eco-friendly packaging quality, food business usability, export readiness, and repeat-order consistency.',
    canonicalPath: '/quality'
  });

  useEffect(() => {
    let active = true;
    fetchCertifications()
      .then((records) => { if (active) setCertifications(records); })
      .catch(() => { if (active) setCertifications([]); });
    return () => { active = false; };
  }, []);

  return (
    <main>
      <SEO
        {...seo}
      />
      <section className="page-hero">
        <div className="page-hero__inner container-xl">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.heading}</h1>
          <p>{hero.description}</p>
        </div>
      </section>

      <section className="page-band">
        <div className="split-panel container-xl">
          <div>
            <h2>Our quality priorities</h2>
            <ul className="check-list">
              {qualityPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <aside className="page-cta-card">
            <h2>Have a specification?</h2>
            <p>Send your material, size, and packing requirements for review.</p>
            <Link to="/contact" className="btn btn-outline">
              Contact Sales
            </Link>
          </aside>
        </div>
      </section>

      {certifications.length > 0 && (
        <section className="page-band page-band--muted quality-certifications" aria-labelledby="certifications-heading">
          <div className="container-xl">
            <div className="page-section-head">
              <span className="eyebrow">Verified Documents</span>
              <h2 id="certifications-heading">Certifications</h2>
              <p>Company documents published after verification by the Kelvin Eco Products administration team.</p>
            </div>
            <div className="quality-certifications__grid">
              {certifications.map((certification) => (
                <article className="quality-certification" key={certification.id}>
                  {certification.icon && <img src={certification.icon} alt={`${certification.title} certificate`} loading="lazy" decoding="async" />}
                  <div>
                    <h3>{certification.title}</h3>
                    {certification.issuer && <p className="quality-certification__issuer">Issued by {certification.issuer}</p>}
                    <p>{certification.description}</p>
                    {certification.certificateNumber && <small>Certificate: {certification.certificateNumber}</small>}
                    {certification.pdfUrl && <a className="quality-certification__link" href={certification.pdfUrl} target="_blank" rel="noreferrer">View document <ExternalLink size={16} /></a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default QualityPage;
