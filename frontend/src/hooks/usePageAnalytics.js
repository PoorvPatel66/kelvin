import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function loadGoogleAnalytics(measurementId) {
  if (!measurementId || window.gtag) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

export function usePageAnalytics() {
  const location = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    loadGoogleAnalytics(measurementId);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !window.gtag) {
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [location.pathname, location.search, measurementId]);
}
