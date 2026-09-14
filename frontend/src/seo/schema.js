import { absoluteUrl, siteConfig } from './seoConfig.js';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: siteConfig.addressCountry
    },
    sameAs: siteConfig.sameAs
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

export function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || product.title,
    description: product.description || product.shortDescription,
    image: product.images?.map((image) => image.url || image).filter(Boolean),
    brand: {
      '@type': 'Brand',
      name: siteConfig.name
    },
    manufacturer: {
      '@type': 'Organization',
      name: siteConfig.name
    },
    category: product.category?.name,
    material: product.material,
    additionalProperty: [
      product.moq ? { '@type': 'PropertyValue', name: 'MOQ', value: product.moq } : null,
      product.capacity ? { '@type': 'PropertyValue', name: 'Capacity', value: product.capacity } : null,
      product.sizes?.length ? { '@type': 'PropertyValue', name: 'Sizes', value: product.sizes.join(', ') } : null
    ].filter(Boolean)
  };
}

export function blogSchema(blog) {
  const publishedDate = blog.publishedAt || blog.createdAt || blog.date;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.thumbnail ? absoluteUrl(blog.thumbnail) : absoluteUrl(siteConfig.defaultImage),
    datePublished: publishedDate ? new Date(publishedDate).toISOString() : undefined,
    dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: siteConfig.name
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(siteConfig.logo)
      }
    },
    mainEntityOfPage: absoluteUrl(`/blog/${blog.slug}`)
  };
}
