import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaBoxOpen,
  FaBuilding,
  FaCheckCircle,
  FaChevronDown,
  FaClipboardCheck,
  FaClipboardList,
  FaEnvelope,
  FaFileUpload,
  FaGlobe,
  FaInfoCircle,
  FaPalette,
  FaPaperPlane,
  FaPhoneAlt,
  FaRegFileAlt,
  FaRegCircle,
  FaSearch,
  FaRulerCombined,
  FaTimes,
  FaTruck,
  FaUser,
  FaUserCheck
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext.jsx';
import { productCatalog } from '../../data/productCatalog.js';
import { siteImages } from '../../data/siteImages.js';
import { submitQuoteInquiry } from '../../services/inquiryService.js';
import { fetchProducts } from '../../services/productService.js';
import { getQuoteSizeOptions, normalizeProductForDisplay } from '../../utils/productDisplay.js';
import './RequestQuoteModal.css';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  product: '',
  size: '',
  customSize: '',
  printing: '',
  message: ''
};

const benefits = [
  { label: 'Best Price Guaranteed', icon: FaCheckCircle },
  { label: 'Premium Quality', icon: FaUserCheck },
  { label: 'On-Time Delivery', icon: FaTruck },
  { label: 'Expert Support', icon: FaInfoCircle }
];

const printingOptions = [
  { label: 'Plain', note: 'No Printing' },
  { label: 'Single Color', note: 'Printing' },
  { label: 'Multi-Color', note: 'Printing' },
  { label: 'Custom Design', note: 'Artwork' }
];

const countryOptions = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia',
  'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Israel',
  'Italy', 'Japan', 'Jordan', 'Kenya', 'Kuwait', 'Latvia', 'Lithuania', 'Malaysia', 'Maldives',
  'Mauritius', 'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Saudi Arabia', 'Singapore', 'Slovakia',
  'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan',
  'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
  'Other Country'
];

const processSteps = [
  {
    title: 'Send Your Request',
    text: 'Fill out the form with your product requirements.',
    icon: FaClipboardList
  },
  {
    title: 'Review & Analysis',
    text: 'Our team will review your requirements carefully.',
    icon: FaSearch
  },
  {
    title: 'Get Best Quote',
    text: 'We will share the best possible quote with you.',
    icon: FaClipboardCheck
  },
  {
    title: 'Confirm Order',
    text: 'Confirm the quote and place your order.',
    icon: FaRegFileAlt
  },
  {
    title: 'Production',
    text: 'High-quality manufacturing with strict quality checks at every process.',
    icon: FaBuilding
  },
  {
    title: 'On-Time Delivery',
    text: 'We manufacture and deliver on time, every time.',
    icon: FaTruck
  }
];

function validateQuote(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Your name is required.';
  if (!values.company.trim()) errors.company = 'Company name is required.';
  if (!values.email.trim()) errors.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.phone.trim()) errors.phone = 'Phone number is required.';
  if (!values.country.trim()) errors.country = 'Country is required.';
  if (!values.product.trim()) errors.product = 'Product name is required.';
  if (!values.size.trim()) errors.size = 'Required size is required.';
  if (values.size === 'Other Size' && !values.customSize.trim()) errors.customSize = 'Please write your required size.';
  if (!values.printing.trim()) errors.printing = 'Printing option is required.';

  return errors;
}

function RequestQuoteModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState(() => productCatalog.map(normalizeProductForDisplay));
  const needsArtworkFile = Boolean(form.printing && form.printing !== 'Plain');

  const selectedProduct = useMemo(
    () => productOptions.find((product) => product.title === form.product || product.name === form.product),
    [form.product, productOptions]
  );
  const sizeOptions = useMemo(
    () => getQuoteSizeOptions(selectedProduct),
    [selectedProduct]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('quote-modal-open');

    window.setTimeout(() => firstFieldRef.current?.focus(), 60);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    fetchProducts({ page: 1, limit: 100 })
      .then((response) => {
        if (Array.isArray(response?.products) && response.products.length) {
          setProductOptions(response.products.map(normalizeProductForDisplay));
        }
      })
      .catch(() => {
        setProductOptions(productCatalog.map(normalizeProductForDisplay));
      });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('quote-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'product' ? { size: '', customSize: '' } : {}),
      ...(name === 'size' && value !== 'Other Size' ? { customSize: '' } : {})
    }));

    if (name === 'printing' && value === 'Plain') {
      setFile(null);
    }

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: ''
      }));
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateQuote(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast({ type: 'error', message: 'Please complete required quote fields.' });
      return;
    }

    const messageParts = [
      `Printing option: ${form.printing}`,
      `Required size: ${form.size === 'Other Size' ? form.customSize : form.size}`,
      form.message ? `Additional details: ${form.message}` : '',
      needsArtworkFile && file ? `Design/logo file mentioned: ${file.name}` : ''
    ].filter(Boolean);

    try {
      setIsSubmitting(true);
      await submitQuoteInquiry({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        country: form.country,
        product: form.product,
        message: messageParts.join('\n')
      });

      setForm(initialForm);
      setFile(null);
      showToast({ type: 'success', message: 'Quote request submitted successfully.' });
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to submit quote request. Please try again.';
      showToast({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="quote-modal" role="presentation">
      <button className="quote-modal__backdrop" type="button" aria-label="Close request quote popup" onClick={onClose} />

      <section
        className="quote-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        ref={dialogRef}
      >
        <button className="quote-modal__close" type="button" aria-label="Close request quote popup" onClick={onClose}>
          <FaTimes aria-hidden="true" />
        </button>

        <div className="quote-modal__hero">
          <div className="quote-modal__brand">
            <img src={siteImages.logo} alt="Kelvin Eco Products" />
            <span>Think Green. Pack Smart.</span>
          </div>

          <div className="quote-modal__intro">
            <h2 id="quote-modal-title">
              Request a <span>Quote</span>
            </h2>
            <p>Please fill in the details below and our team will get back to you with the best possible quote.</p>
          </div>

          <img
            className="quote-modal__products"
            src={siteImages.home.heroPackaging}
            alt="Kelvin eco-friendly packaging product range"
            loading="lazy"
          />
        </div>

        <div className="quote-modal__benefits" aria-label="Quote benefits">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div className="quote-modal__benefit" key={benefit.label}>
                <Icon aria-hidden="true" />
                <span>{benefit.label}</span>
              </div>
            );
          })}
        </div>

        <form className="quote-form" onSubmit={handleSubmit} noValidate>
          <div className="quote-form__grid">
            <label className="quote-field">
              <span><FaUser aria-hidden="true" /> Your Name <small>(Required)</small></span>
              <input
                ref={firstFieldRef}
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'quote-input quote-input--error' : 'quote-input'}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label className="quote-field">
              <span><FaBuilding aria-hidden="true" /> Company Name <small>(Required)</small></span>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className={errors.company ? 'quote-input quote-input--error' : 'quote-input'}
                placeholder="Enter your company name"
                autoComplete="organization"
              />
              {errors.company && <em>{errors.company}</em>}
            </label>

            <label className="quote-field">
              <span><FaEnvelope aria-hidden="true" /> Email Address <small>(Required)</small></span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'quote-input quote-input--error' : 'quote-input'}
                placeholder="Enter your email address"
                autoComplete="email"
              />
              {errors.email && <em>{errors.email}</em>}
            </label>

            <label className="quote-field">
              <span><FaPhoneAlt aria-hidden="true" /> Phone Number <small>(Required)</small></span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? 'quote-input quote-input--error' : 'quote-input'}
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
              {errors.phone && <em>{errors.phone}</em>}
            </label>

            <label className="quote-field">
              <span><FaGlobe aria-hidden="true" /> Country <small>(Required)</small></span>
              <div className="quote-select-wrap">
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={errors.country ? 'quote-input quote-input--error' : 'quote-input'}
                  autoComplete="country-name"
                >
                  <option value="">Select country</option>
                  {countryOptions.map((country) => (
                    <option value={country} key={country}>{country}</option>
                  ))}
                </select>
                <FaChevronDown aria-hidden="true" />
              </div>
              {errors.country && <em>{errors.country}</em>}
            </label>

            <label className="quote-field">
              <span><FaBoxOpen aria-hidden="true" /> Products Name <small>(Required)</small></span>
              <div className="quote-select-wrap">
                <select
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  className={errors.product ? 'quote-input quote-input--error' : 'quote-input'}
                >
                  <option value="">Select product category</option>
                  {productOptions.map((product) => (
                    <option value={product.title} key={product.slug || product.title}>{product.title}</option>
                  ))}
                </select>
                <FaChevronDown aria-hidden="true" />
              </div>
              {errors.product && <em>{errors.product}</em>}
            </label>

            <label className="quote-field">
              <span><FaRulerCombined aria-hidden="true" /> Required Size <small>(Required)</small></span>
              <div className="quote-select-wrap">
                <select
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className={errors.size ? 'quote-input quote-input--error' : 'quote-input'}
                  disabled={!form.product}
                >
                  <option value="">{form.product ? 'Select required size' : 'Select product first'}</option>
                  {sizeOptions.map((size) => (
                    <option value={size} key={size}>{size}</option>
                  ))}
                  <option value="Other Size">Other Size</option>
                </select>
                <FaChevronDown aria-hidden="true" />
              </div>
              {errors.size && <em>{errors.size}</em>}
            </label>

            {form.size === 'Other Size' && (
              <label className="quote-field">
                <span><FaRulerCombined aria-hidden="true" /> Write Other Size <small>(Required)</small></span>
                <input
                  name="customSize"
                  value={form.customSize}
                  onChange={handleChange}
                  className={errors.customSize ? 'quote-input quote-input--error' : 'quote-input'}
                  placeholder="Enter custom size / capacity"
                />
                {errors.customSize && <em>{errors.customSize}</em>}
              </label>
            )}
          </div>

          <fieldset className="quote-printing">
            <legend><FaPalette aria-hidden="true" /> Printing Options <small>(Required)</small></legend>
            <div className="quote-printing__grid">
              {printingOptions.map((option) => (
                <label className={form.printing === option.label ? 'quote-printing__option active' : 'quote-printing__option'} key={option.label}>
                  <input
                    type="radio"
                    name="printing"
                    value={option.label}
                    checked={form.printing === option.label}
                    onChange={handleChange}
                  />
                  {form.printing === option.label ? <FaCheckCircle aria-hidden="true" /> : <FaRegCircle aria-hidden="true" />}
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.note}</small>
                  </span>
                </label>
              ))}
            </div>
            {errors.printing && <em className="quote-printing__error">{errors.printing}</em>}
          </fieldset>

          {needsArtworkFile && (
            <>
              <label className="quote-upload">
                <input type="file" onChange={handleFileChange} accept=".ai,.pdf,.eps,.cdr,.psd,.png,.jpg,.jpeg,.svg" />
                <FaFileUpload aria-hidden="true" />
                <span>
                  <strong>{file ? file.name : 'Click to upload or drag and drop'}</strong>
                  <small>Accepted formats: AI, PDF, EPS, CDR, PSD, PNG, JPG, SVG</small>
                </span>
              </label>

              <div className="quote-note">
                <FaInfoCircle aria-hidden="true" />
                <span>If you have large files, provide a link like Google Drive in the message box below.</span>
              </div>
            </>
          )}

          <label className="quote-field quote-field--wide">
            <span><FaInfoCircle aria-hidden="true" /> Message / Additional Details <small>(Optional)</small></span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="quote-textarea"
              placeholder="Enter quantity, delivery destination, expected order date, or special instructions..."
            />
          </label>

          <button className="quote-submit" type="submit" disabled={isSubmitting}>
            <FaPaperPlane aria-hidden="true" />
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <div className="quote-process" aria-label="Our simple 6 step process">
          <h3>Our Simple <span>6</span> Step Process</h3>
          <div className="quote-process__track">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="quote-process__step" key={step.title}>
                  <span className="quote-process__number">{index + 1}</span>
                  <span className="quote-process__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RequestQuoteModal;
