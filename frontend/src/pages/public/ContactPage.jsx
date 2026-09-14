import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  Clock3,
  Factory,
  Globe2,
  Headphones,
  Leaf,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  User,
  Building2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import SEO from '../../components/seo/SEO.jsx';
import { breadcrumbSchema } from '../../seo/schema.js';
import { submitContactInquiry, submitQuoteInquiry } from '../../services/inquiryService.js';
import { siteImages } from '../../data/siteImages.js';
import { usePublishedPage } from '../../hooks/usePublishedPage.js';
import { getCmsSection, getCmsSeo } from '../../utils/cmsPage.js';
import './ContactPage.css';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  product: '',
  message: ''
};

const countryOptions = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Oman',
  'Qatar',
  'United Kingdom',
  'Canada',
  'Australia',
  'South Africa',
  'Kuwait',
  'Singapore',
  'Malaysia',
  'United States'
];

const heroBenefits = [
  { label: 'Eco-Friendly Solutions', icon: Leaf },
  { label: 'Premium Quality', icon: ShieldCheck },
  { label: 'Timely Delivery', icon: Truck },
  { label: 'Dedicated Support', icon: Headphones }
];

const whyChooseItems = [
  { label: 'Sustainable Packaging', icon: Leaf },
  { label: 'Global Standards', icon: Globe2 },
  { label: 'Wide Product Range', icon: Box },
  { label: 'Custom Printing Available', icon: PackageCheck },
  { label: 'Competitive Pricing', icon: Factory },
  { label: 'Dedicated Support', icon: Headphones }
];

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!values.company.trim()) {
    errors.company = 'Company name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^[0-9+\-\s()]{7,20}$/.test(values.phone)) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!values.country.trim()) {
    errors.country = 'Country is required.';
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
}

function ContactPage() {
  const location = useLocation();
  const { showToast } = useToast();
  const isQuotePage = location.pathname.includes('request-quote');
  const cmsPage = usePublishedPage('contact');
  const hero = getCmsSection(cmsPage, 'hero', {
    eyebrow: "We're Here to Help",
    heading: 'Contact',
    accent: 'Us',
    description: 'Have a question, need a quote, or want to know more about our eco-friendly packaging solutions? Our team is ready to assist you.'
  });
  const seo = getCmsSeo(cmsPage, {
    title: isQuotePage ? 'Request Quote' : 'Contact',
    description: 'Contact Kelvin Eco Products for eco-friendly packaging, export supply, bulk orders, and custom printed packaging quotations.',
    canonicalPath: isQuotePage ? '/request-quote' : '/contact'
  });
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: ''
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setStatus({ type: '', message: '' });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (isQuotePage) {
        await submitQuoteInquiry(form);
      } else {
        await submitContactInquiry(form);
      }
      setForm(initialForm);
      setStatus({
        type: 'success',
        message: 'Thank you. Your inquiry has been sent successfully.'
      });
      showToast({ type: 'success', message: 'Inquiry sent successfully.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send inquiry. Please try again.';
      setStatus({
        type: 'error',
        message
      });
      showToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="contact-page">
      <SEO
        {...seo}
        jsonLd={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: isQuotePage ? 'Request Quote' : 'Contact', url: isQuotePage ? '/request-quote' : '/contact' }
        ])}
      />
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-hero__overlay container-xl">
          <div className="contact-hero__content">
            <span className="contact-hero__eyebrow">{hero.eyebrow}</span>
            <h1 id="contact-title">{hero.heading} <span>{hero.accent}</span></h1>
            <p>{hero.description}</p>
          </div>

          <div className="contact-hero__visual" aria-hidden="true">
            <img src={siteImages.home.heroPackaging} alt="" />
          </div>

          <div className="contact-benefits" aria-label="Kelvin Eco Products support benefits">
            {heroBenefits.map(({ label, icon: Icon }) => (
              <div className="contact-benefit" key={label}>
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-section__inner container-xl">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-card__heading">
              <Send size={30} aria-hidden="true" />
              <div>
                <h2>Send Us a Message</h2>
                <p>Fill out the form and our team will get back to you shortly.</p>
              </div>
            </div>

            <div className="contact-form__grid">
              <div className="form-field">
                <label className="form-label" htmlFor="name"><User size={15} aria-hidden="true" /> Your Name*</label>
                <input className={`input ${errors.name ? 'input--error' : ''}`} id="name" name="name" type="text" value={form.name} onChange={handleChange} autoComplete="name" placeholder="Enter your full name" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="company"><Building2 size={15} aria-hidden="true" /> Company Name*</label>
                <input className={`input ${errors.company ? 'input--error' : ''}`} id="company" name="company" type="text" value={form.company} onChange={handleChange} autoComplete="organization" placeholder="Enter your company name" />
                {errors.company && <span className="form-error">{errors.company}</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email"><Mail size={15} aria-hidden="true" /> Email Address*</label>
                <input className={`input ${errors.email ? 'input--error' : ''}`} id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="Enter your email address" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="phone"><Phone size={15} aria-hidden="true" /> Phone Number*</label>
                <input className={`input ${errors.phone ? 'input--error' : ''}`} id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="Enter your phone number" />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="country"><Globe2 size={15} aria-hidden="true" /> Country*</label>
                <select className={`select ${errors.country ? 'input--error' : ''}`} id="country" name="country" value={form.country} onChange={handleChange} autoComplete="country-name">
                  <option value="">Select country</option>
                  {countryOptions.map((country) => (
                    <option value={country} key={country}>{country}</option>
                  ))}
                </select>
                {errors.country && <span className="form-error">{errors.country}</span>}
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="product"><PackageCheck size={15} aria-hidden="true" /> Subject</label>
                <select className="select" id="product" name="product" value={form.product} onChange={handleChange}>
                  <option value="">Select subject</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                  <option value="Bulk Order">Bulk Order</option>
                  <option value="Custom Printing">Custom Printing</option>
                  <option value="Export Supply">Export Supply</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="message"><MessageSquare size={15} aria-hidden="true" /> Your Message*</label>
              <textarea
                className={`textarea ${errors.message ? 'input--error' : ''}`}
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about product type, quantity, size, destination, or custom printing requirements."
              />
              {errors.message && <span className="form-error">{errors.message}</span>}
            </div>

            {status.message && (
              <div className={`contact-form__status contact-form__status--${status.type}`}>
                {status.message}
              </div>
            )}

            <button className="contact-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'} <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>

          <aside className="contact-info">
            <img
              className="contact-info__earth"
              src="/images/contact-earth.png"
              alt=""
              loading="lazy"
              decoding="async"
              aria-hidden="true"
            />
            <div className="contact-card__heading">
              <Phone size={30} aria-hidden="true" />
              <div>
                <h2>Contact Information</h2>
                <p>Reach out through any of the following channels.</p>
              </div>
            </div>

            <div className="contact-info__list">
              <a href="https://maps.app.goo.gl/ZbKqns2X5JxQJc8Y9" target="_blank" rel="noopener noreferrer">
                <span className="contact-info__icon"><MapPin size={22} aria-hidden="true" /></span>
                <span>
                  <strong>Head Office</strong>
                  Chappara GIDC, Rajkot - 360024, Gujarat, India
                </span>
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=71-75%20Shelton%20Street%2C%20Covent%20Garden%2C%20London%2C%20United%20Kingdom%2C%20WC2H%209JQ" target="_blank" rel="noopener noreferrer">
                <span className="contact-info__icon"><MapPin size={22} aria-hidden="true" /></span>
                <span>
                  <strong>Corporate Office</strong>
                  71-75 Shelton Street, Covent Garden, London, United Kingdom, WC2H 9JQ
                </span>
              </a>
              <a href="tel:+919687503514">
                <span className="contact-info__icon"><Phone size={22} aria-hidden="true" /></span>
                <span><strong>Phone Number</strong>+91 9687 503514</span>
              </a>
              <a href="tel:+917048503513">
                <span className="contact-info__icon"><Phone size={22} aria-hidden="true" /></span>
                <span><strong>Alternate Number</strong>+91 7048 503513</span>
              </a>
              <a href="mailto:kelvinecoproducts@gmail.com">
                <span className="contact-info__icon"><Mail size={22} aria-hidden="true" /></span>
                <span><strong>Email Address</strong>kelvinecoproducts@gmail.com</span>
              </a>
              <a href="mailto:info@kelvinecoproducts.in">
                <span className="contact-info__icon"><Mail size={22} aria-hidden="true" /></span>
                <span><strong>Alternate Email Address</strong>info@kelvinecoproducts.in</span>
              </a>
              <a href="https://www.kelvinecoproducts.in/" target="_blank" rel="noopener noreferrer">
                <span className="contact-info__icon"><Globe2 size={22} aria-hidden="true" /></span>
                <span><strong>Website India</strong>kelvinecoproducts.in</span>
              </a>
              <div>
                <span className="contact-info__icon"><Clock3 size={22} aria-hidden="true" /></span>
                <span>
                  <strong>Business Hours</strong>
                  9:00 AM - 6:00 PM
                </span>
              </div>
            </div>
          </aside>

          <section className="contact-map" aria-labelledby="find-us-title">
            <div className="contact-map__earth" aria-hidden="true">
              <span />
            </div>
            <div className="contact-map__panel">
              <MapPin size={28} aria-hidden="true" />
              <h2 id="find-us-title">Find Us</h2>
              <p>We are located in the heart of Rajkot, Gujarat. You can visit us anytime during business hours.</p>
              <a className="contact-map__button" href="https://maps.app.goo.gl/ZbKqns2X5JxQJc8Y9" target="_blank" rel="noopener noreferrer">
                Get Directions <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <iframe
              title="Kelvin Eco Products location map"
              src="https://maps.google.com/maps?q=Kelvin%20Eco%20Products%2C%20Chhapra%2C%20Rajkot%2C%20Gujarat&t=k&z=14&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section className="contact-why" aria-label="Why choose Kelvin Eco Products">
            <h2>Why Choose Kelvin Eco Products?</h2>
            <div className="contact-why__grid">
              {whyChooseItems.map(({ label, icon: Icon }) => (
                <div className="contact-why__item" key={label}>
                  <Icon size={25} aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
