import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { siteImages } from '../../data/siteImages.js';
import { useSiteConfiguration } from '../../context/SiteConfigurationContext.jsx';
import './Footer.css';

const socialIcons = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  twitter: FaTwitter
};

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function Footer() {
  const { settings, linksFor } = useSiteConfiguration();
  const quickLinks = linksFor('FOOTER_QUICK');
  const moreLinks = linksFor('FOOTER_MORE');
  const serviceLinks = linksFor('FOOTER_SERVICES');
  const socialLinks = Object.entries(settings.socialLinks || {})
    .filter(([name, href]) => socialIcons[name] && href)
    .map(([name, href]) => ({ label: name, href, icon: socialIcons[name] }));
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.headOffice || '')}`;
  const renderFooterLink = (link) => link.isExternal ? (
    <a href={link.path} target="_blank" rel="noopener noreferrer">{link.label}</a>
  ) : (
    <Link to={link.path}>{link.label}</Link>
  );

  return (
    <footer className="site-footer">

      <motion.div 
        className="site-footer__inner container-xl"
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="site-footer__brand" variants={itemVariants}>
          <Link to="/" className="site-footer__logo" aria-label="Kelvin Eco Products home">
            <img src={settings.logoUrl || siteImages.logo} alt={settings.siteName || 'Kelvin Eco Products'} />
          </Link>
          <p>{settings.footerDescription}</p>

          <div className="site-footer__socials" aria-label="Social links">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </motion.div>

        <motion.nav className="site-footer__column" aria-label="Quick links" variants={itemVariants}>
          <h2>Quick Links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.label}>
                {renderFooterLink(link)}
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.nav className="site-footer__column" aria-label="More links" variants={itemVariants}>
          <h2>More Links</h2>
          <ul>
            {moreLinks.map((link) => (
              <li key={link.label}>
                {renderFooterLink(link)}
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.nav className="site-footer__column" aria-label="Service links" variants={itemVariants}>
          <h2>Services</h2>
          <ul>
            {serviceLinks.map((link) => (
              <li key={link.label}>
                {renderFooterLink(link)}
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.div className="site-footer__column site-footer__contact" variants={itemVariants}>
          <h2>Contact Us</h2>
          <ul>
            <li>
              <a href={`tel:${settings.primaryPhone}`}>
                <Phone size={18} />
                <span>{settings.primaryPhone}</span>
              </a>
              <a href={`tel:${settings.alternatePhone}`}>
                <Phone size={18} />
                <span>{settings.alternatePhone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.primaryEmail}`}>
                <Mail size={18} />
                <span>{settings.primaryEmail}</span>
              </a>
            </li>
            <li>
              <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe size={18} />
                <span>{String(settings.websiteUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </a>
            </li>
            <li>
              <span>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin size={18} />
                  <span>Head Office, <br/>{settings.headOffice}</span>
                </a>
                {/* <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                  <MapPin size={18} />
                  <span>Corporate Office, <br/>71-75, Shelton Street, Covent Garden, London, United Kingdom, WC2H 9JQ, United Kingdom</span>
                </a> */}
              </span>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      <div className="site-footer__bottom">
        <div className="container-xl bottom-bar-inner">
          <p>Copyright 2025 {settings.siteName}. All Rights Reserved.</p>
          <p>
            Design & Developed By{" "}
            <a
                href="https://www.linkedin.com/in/poorv-d-patel-6-d2006/"
                target="_blank"
                rel="noopener noreferrer"
                className="developer-link"
            >
                Poorv Patel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
