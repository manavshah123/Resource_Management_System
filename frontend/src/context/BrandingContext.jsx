import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '@api/settingsApi';
import { getThemeById, themePresets } from '../themes/themePresets';

const BrandingContext = createContext(null);

const defaultBranding = {
  appName: 'Resource Management Portal',
  appLogo: '',
  appFavicon: '',
  themeId: 'default',
  companyName: 'RMP',
  supportEmail: 'support@rmp.com',
  copyrightText: '© 2024 RMP. All rights reserved.',
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [currentTheme, setCurrentTheme] = useState(getThemeById('default'));
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await settingsApi.getPublicBranding();
      const data = response.data || {};
      const brandingData = { ...defaultBranding, ...data };
      setBranding(brandingData);
      
      // Get theme from themeId or use colors to find matching theme
      const theme = getThemeById(data.themeId || 'default');
      setCurrentTheme(theme);
      applyBranding(brandingData, theme);
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      applyBranding(defaultBranding, getThemeById('default'));
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (config, theme) => {
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

    // Apply theme colors as CSS custom properties
    applyTheme(theme);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const colors = theme.colors;
    
    // Primary colors
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--primary-color-light', `${colors.primary}20`);
    root.style.setProperty('--primary-color-dark', adjustColor(colors.primary, -20));
    
    // Secondary colors
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--secondary-color-light', `${colors.secondary}20`);
    
    // Sidebar colors
    root.style.setProperty('--sidebar-bg', colors.sidebar);
    root.style.setProperty('--sidebar-text', colors.sidebarText);
    
    // Accent colors
    root.style.setProperty('--accent-color', colors.accent);
    
    // Background
    root.style.setProperty('--background-color', colors.background);
    
    // Update body background for dark themes
    if (theme.id === 'midnight') {
      document.body.style.backgroundColor = colors.background;
      document.body.style.color = '#e2e8f0';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }

    setCurrentTheme(theme);
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

  const setTheme = (themeId) => {
    const theme = getThemeById(themeId);
    applyTheme(theme);
    return theme;
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ 
      branding, 
      currentTheme,
      loading, 
      refreshBranding, 
      setTheme,
      themePresets 
    }}>
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
