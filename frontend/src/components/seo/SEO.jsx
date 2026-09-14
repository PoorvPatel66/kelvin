import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, siteConfig } from '../../seo/seoConfig.js';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      element.setAttribute(key, value);
    }
  });
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setJsonLd(schemas) {
  document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((script) => script.remove());

  schemas.filter(Boolean).forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoJsonld = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

function SEO({
  title,
  description = siteConfig.defaultDescription,
  image = siteConfig.defaultImage,
  type = 'website',
  canonicalPath,
  noindex = false,
  robots,
  keywords = [],
  jsonLd = []
}) {
  const location = useLocation();
  const keywordContent = Array.isArray(keywords) ? keywords.join(', ') : String(keywords || '');

  useEffect(() => {
    const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.defaultTitle;
    const canonicalUrl = absoluteUrl(canonicalPath || location.pathname);
    const imageUrl = absoluteUrl(image);

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex,nofollow' : robots || 'index,follow'
    });
    if (keywordContent.trim()) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywordContent.trim() });
    } else {
      removeMeta('meta[name="keywords"]');
    }
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteConfig.name });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    if (import.meta.env.VITE_GSC_VERIFICATION) {
      upsertMeta('meta[name="google-site-verification"]', {
        name: 'google-site-verification',
        content: import.meta.env.VITE_GSC_VERIFICATION
      });
    }

    upsertLink('canonical', canonicalUrl);
    setJsonLd(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
  }, [canonicalPath, description, image, jsonLd, keywordContent, location.pathname, noindex, robots, title, type]);

  return null;
}

export default SEO;
