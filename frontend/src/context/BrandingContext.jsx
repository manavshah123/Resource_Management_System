import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '@api/settingsApi';

const BrandingContext = createContext(null);

const defaultBranding = {
  appName: 'Resource Management Portal',
  appLogo: '',
  appFavicon: '',
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  companyName: 'RMP',
  supportEmail: 'support@rmp.com',
  copyrightText: '© 2024 RMP. All rights reserved.',
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await settingsApi.getPublicBranding();
      const data = response.data || {};
      setBranding({ ...defaultBranding, ...data });
      applyBranding(data);
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      applyBranding(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (config) => {
    // Apply document title
    if (config.appName) {
      document.title = config.appName;
    }

    // Apply favicon
    if (config.appFavicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.appFavicon;
    }

    // Apply CSS custom properties for colors
    const root = document.documentElement;
    if (config.primaryColor) {
      root.style.setProperty('--primary-color', config.primaryColor);
      root.style.setProperty('--primary-color-light', `${config.primaryColor}20`);
      root.style.setProperty('--primary-color-dark', adjustColor(config.primaryColor, -20));
    }
    if (config.secondaryColor) {
      root.style.setProperty('--secondary-color', config.secondaryColor);
      root.style.setProperty('--secondary-color-light', `${config.secondaryColor}20`);
    }
  };

  // Helper to darken/lighten a hex color
  const adjustColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  const refreshBranding = async () => {
    await fetchBranding();
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

export default BrandingContext;

