import { FaWhatsapp } from 'react-icons/fa';
import { useSiteConfiguration } from '../../context/SiteConfigurationContext.jsx';
import './FloatingWhatsApp.css';

function FloatingWhatsApp() {
  const { settings } = useSiteConfiguration();
  const whatsappNumber = settings.whatsappNumber || '919687503514';
  const message = encodeURIComponent(
    `Hello ${settings.siteName || 'Kelvin Eco Products'}, I want to know more about your packaging products.`
  );

  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${settings.siteName || 'Kelvin Eco Products'} on WhatsApp`}
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}

export default FloatingWhatsApp;
