import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { siteImages } from '../../data/siteImages.js';
import { useSiteConfiguration } from '../../context/SiteConfigurationContext.jsx';
import './Navbar.css';

const navbarVariants = {
  hidden: { y: -110, opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }
};

function Navbar() {
  const { settings, linksFor } = useSiteConfiguration();
  const navLinks = linksFor('HEADER');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const hasMovedEnough = Math.abs(currentScrollY - lastScrollY) > 8;

      if (currentScrollY < 80) {
        setIsHeaderVisible(true);
      } else if (hasMovedEnough) {
        setIsHeaderVisible(!isScrollingDown);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      setIsHeaderVisible(true);
    }
  }, [isMenuOpen]);

  return (
    <header className="site-header-pill">
      <motion.nav 
        className="navbar-pill" 
        aria-label="Main navigation"
        variants={navbarVariants}
        initial="hidden"
        animate={isHeaderVisible ? 'visible' : 'hidden'}
      >
        <div className="navbar-pill__inner">
          <div className="navbar-pill__logo-area">
            <Link to="/" className="navbar-pill__logo" onClick={closeMenu} aria-label="Kelvin Eco Products home">
              <img src={settings.logoUrl || siteImages.logo} alt={settings.siteName || 'Kelvin Eco Products'} />
            </Link>
          </div>

          <div className={`navbar-pill__menu-area ${isMenuOpen ? 'open' : ''}`}>
            <ul className="navbar-pill__links">
              {navLinks.map((link) => (
                <li className="navbar-pill__item" key={link.path}>
                  {link.isExternal ? (
                    <a href={link.path} className="navbar-pill__link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                      {link.label}
                      <span className="navbar-pill__link-hover-line"></span>
                    </a>
                  ) : (
                    <NavLink
                      to={link.path}
                      end={link.path === '/'}
                      className={({ isActive }) =>
                        isActive ? 'navbar-pill__link navbar-pill__link--active' : 'navbar-pill__link'
                      }
                      onClick={closeMenu}
                    >
                      {link.label}
                      <span className="navbar-pill__link-hover-line"></span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-pill__action-area">
            <button
              className="navbar-pill__toggle"
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="primary-menu"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? <X size={24} color="#0F2D52" /> : <Menu size={24} color="#0F2D52" />}
            </button>
          </div>
        </div>
      </motion.nav>
    </header>
  );
}

export default Navbar;
