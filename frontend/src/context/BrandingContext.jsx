import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { settingsApi } from '@api/settingsApi';
import { themePresets, getThemeById } from '../themes/themePresets';

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
  const [currentTheme, setCurrentTheme] = useState(themePresets[0]);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Store the saved theme ID to revert to if preview is cancelled
  const savedThemeIdRef = useRef('default');

  const fetchBranding = async () => {
    try {
      const response = await settingsApi.getPublicBranding();
      const data = response.data || {};
      setBranding({ ...defaultBranding, ...data });
      savedThemeIdRef.current = data.themeId || 'default';
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

    // Apply theme
    const themeId = config.themeId || 'default';
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const colors = theme.colors;

    // Apply primary color variations
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--primary-color-light', `${colors.primary}20`);
    root.style.setProperty('--primary-color-dark', adjustColor(colors.primary, -20));
    root.style.setProperty('--primary-color-rgb', hexToRgb(colors.primary));

    // Apply secondary color variations
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--secondary-color-light', `${colors.secondary}20`);
    root.style.setProperty('--secondary-color-rgb', hexToRgb(colors.secondary));

    // Apply sidebar colors
    root.style.setProperty('--sidebar-bg', colors.sidebar);
    root.style.setProperty('--sidebar-text', colors.sidebarText);

    // Apply accent color
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--accent-color-rgb', hexToRgb(colors.accent));

    // Apply background color
    root.style.setProperty('--bg-default', colors.background);
    root.style.setProperty('--bg-paper', colors.background === '#0f172a' ? '#1e293b' : '#ffffff');

    // Apply text colors based on background
    const isDark = isColorDark(colors.background);
    root.style.setProperty('--text-primary', isDark ? '#f1f5f9' : '#1e293b');
    root.style.setProperty('--text-secondary', isDark ? '#94a3b8' : '#64748b');

    // Apply gradient
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`);
    root.style.setProperty('--gradient-secondary', `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`);
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

  // Helper to convert hex to rgb values
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '59, 130, 246';
  };

  // Helper to determine if a color is dark
  const isColorDark = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return false;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const refreshBranding = async () => {
    await fetchBranding();
    setIsPreviewMode(false);
  };

  // Preview a theme without saving (live preview)
  const previewTheme = (themeId) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsPreviewMode(true);
  };

  // Revert to the last saved theme
  const revertTheme = () => {
    const theme = getThemeById(savedThemeIdRef.current);
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsPreviewMode(false);
  };

  // Commit the current preview as the saved theme
  const commitTheme = (themeId) => {
    savedThemeIdRef.current = themeId;
    setIsPreviewMode(false);
  };

  // Get the saved theme ID
  const getSavedThemeId = () => savedThemeIdRef.current;

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ 
      branding, 
      loading, 
      currentTheme, 
      isPreviewMode,
      refreshBranding, 
      previewTheme,
      revertTheme,
      commitTheme,
      getSavedThemeId,
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
