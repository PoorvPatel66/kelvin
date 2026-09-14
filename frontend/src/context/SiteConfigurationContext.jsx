import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { fallbackNavigation, fallbackSiteSettings } from '../data/siteConfiguration.js';

const SiteConfigurationContext = createContext(null);

export function SiteConfigurationProvider({ children }) {
  const [settings, setSettings] = useState(fallbackSiteSettings);
  const [navigation, setNavigation] = useState(fallbackNavigation);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.get('/site-settings'), api.get('/navigation')]).then(([settingsResult, navigationResult]) => {
      if (!active) return;
      if (settingsResult.status === 'fulfilled' && settingsResult.value.data?.settings) {
        setSettings({ ...fallbackSiteSettings, ...settingsResult.value.data.settings });
      }
      if (navigationResult.status === 'fulfilled' && navigationResult.value.data?.items?.length) {
        setNavigation(navigationResult.value.data.items);
      }
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    settings,
    navigation,
    linksFor: (area) => navigation.filter((item) => item.area === area && item.isVisible !== false)
  }), [navigation, settings]);

  return <SiteConfigurationContext.Provider value={value}>{children}</SiteConfigurationContext.Provider>;
}

export function useSiteConfiguration() {
  return useContext(SiteConfigurationContext);
}
