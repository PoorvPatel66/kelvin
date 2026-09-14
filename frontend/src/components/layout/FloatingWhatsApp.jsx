import { FaWhatsapp } from 'react-icons/fa';
import './FloatingWhatsApp.css';

function FloatingWhatsApp() {
  const message = encodeURIComponent(
    'Hello Kelvin Eco Products, I want to know more about your packaging products.'
  );

  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/919687503514?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Kelvin Eco Products on WhatsApp"
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}

export default FloatingWhatsApp;
