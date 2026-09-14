export function getCmsSection(page, sectionKey, fallback = {}) {
  const section = page?.sections?.[sectionKey];

  if (typeof section === 'string') {
    return { ...fallback, heading: section };
  }

  if (!section || Array.isArray(section) || typeof section !== 'object') {
    return fallback;
  }

  return { ...fallback, ...section };
}

export function getCmsSeo(page, fallback) {
  return {
    title: page?.seoTitle || fallback.title,
    description: page?.seoDescription || fallback.description,
    image: page?.ogImage || fallback.image,
    canonicalPath: page?.canonicalUrl || fallback.canonicalPath,
    keywords: page?.seoKeywords || fallback.keywords || [],
    robots: page?.metaRobots || fallback.robots
  };
}
