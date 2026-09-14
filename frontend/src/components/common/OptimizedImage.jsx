function getCloudinaryUrl(src, width) {
  if (!src?.includes('/upload/')) {
    return src;
  }

  return src.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

function OptimizedImage({ src, alt, widths = [480, 768, 1200], sizes = '100vw', className = '' }) {
  if (!src) {
    return null;
  }

  const srcSet = widths.map((width) => `${getCloudinaryUrl(src, width)} ${width}w`).join(', ');

  return (
    <img
      className={className}
      src={getCloudinaryUrl(src, widths[1] || widths[0])}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}

export default OptimizedImage;
