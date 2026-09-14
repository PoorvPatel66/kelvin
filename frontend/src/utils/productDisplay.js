import { productCatalog, getProductBySlug } from '../data/productCatalog.js';
import { siteImages } from '../data/siteImages.js';

function splitValueList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function findLocalProduct(product = {}) {
  return (
    productCatalog.find((item) => item.slug === product.slug) ||
    productCatalog.find((item) => item.title === product.name) ||
    productCatalog.find((item) => item.name === product.name) ||
    {}
  );
}

export function normalizeProductForDisplay(product = {}) {
  const localProduct = findLocalProduct(product);
  const specificationDetails =
    product.specifications && !Array.isArray(product.specifications)
      ? product.specifications
      : {};
  const specifications = Array.isArray(product.specifications)
    ? product.specifications
    : localProduct.specifications || [];
  const printing = specificationDetails.printing || localProduct.printing || [];
  const colours = specificationDetails.colours || localProduct.colours || [];
  const features = specificationDetails.features || localProduct.features || [];

  return {
    ...localProduct,
    ...product,
    title: product.name || localProduct.title || localProduct.name || 'Packaging Product',
    name: product.name || localProduct.name || localProduct.title || 'Packaging Product',
    category: product.category?.name || localProduct.category || 'Packaging',
    categorySlug: product.category?.slug || localProduct.categorySlug || '',
    image: product.images?.[0]?.url || localProduct.image || siteImages.home.heroPackaging,
    description: product.description || localProduct.description || '',
    shortDescription: product.shortDescription || localProduct.shortDescription || '',
    material: product.material || specificationDetails.material || localProduct.material || '',
    sizes: splitValueList(product.sizes).length ? splitValueList(product.sizes) : splitValueList(localProduct.sizes),
    capacity: product.capacity || localProduct.capacity || '',
    usage: product.usage || specificationDetails.usage || localProduct.usage || '',
    printing,
    colours,
    coating: product.coating || specificationDetails.coating || localProduct.coating || '',
    features,
    packingDetails:
      product.packingDetails ||
      specificationDetails.packingDetails ||
      localProduct.packingDetails ||
      product.moq ||
      '',
    options:
      product.options ||
      localProduct.options ||
      (printing.length ? printing.join(' / ') : ''),
    products:
      product.products ||
      (Array.isArray(product.variants) && product.variants.length
        ? product.variants.map((variant) => variant.name).filter(Boolean)
        : localProduct.products || []),
    specifications,
    source: product.id ? 'api' : 'local'
  };
}

export function getFallbackDisplayProduct(slug) {
  const localProduct = getProductBySlug(slug);
  return localProduct ? normalizeProductForDisplay(localProduct) : null;
}

export function getQuoteSizeOptions(product) {
  if (!product) {
    return [];
  }

  const specificationSizes = Array.isArray(product.specifications)
    ? product.specifications.map((item) => item.size).filter(Boolean)
    : [];

  if (specificationSizes.length) {
    return [...new Set(specificationSizes)];
  }

  if (Array.isArray(product.sizes) && product.sizes.length) {
    return [...new Set(product.sizes)];
  }

  return [];
}
