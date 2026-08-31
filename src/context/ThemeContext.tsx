import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PortfolioSettings, ThemeConfig } from '../types/portfolio';
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_THEME_CONFIG } from '../services/defaultData';
import { portfolioStore } from '../services/store';

interface ThemeContextType {
  settings: PortfolioSettings;
  themeConfig: ThemeConfig;
  loading: boolean;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  updateThemeConfig: (newConfig: ThemeConfig) => Promise<void>;
  updateSettings: (newSettings: Partial<PortfolioSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PortfolioSettings>(DEFAULT_PORTFOLIO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check system prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await portfolioStore.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações do tema:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const themeConfig = settings.theme_config || DEFAULT_THEME_CONFIG;

  // Apply CSS custom properties dynamically to document head / element
  useEffect(() => {
    const root = document.documentElement;
    const colors = themeConfig.colors || DEFAULT_THEME_CONFIG.colors;
    const typography = themeConfig.typography || DEFAULT_THEME_CONFIG.typography;
    const radius = themeConfig.radius || DEFAULT_THEME_CONFIG.radius;
    const layout = themeConfig.layout || DEFAULT_THEME_CONFIG.layout;
    const header = { ...DEFAULT_THEME_CONFIG.header, ...(themeConfig.header || {}) };
    const motion = themeConfig.motion || DEFAULT_THEME_CONFIG.motion;

    // Colors
    root.style.setProperty('--color-bg', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-focus', colors.focus);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);

    // Typography
    root.style.setProperty('--font-headings', typography.fontFamilyHeadings || 'Plus Jakarta Sans, sans-serif');
    root.style.setProperty('--font-body', typography.fontFamilyBody || 'Inter, sans-serif');
    root.style.setProperty('--font-size-base', `${typography.baseSizePx || 16}px`);
    root.style.setProperty('--font-heading-weight', `${typography.headingWeight || 700}`);
    root.style.setProperty('--font-body-weight', `${typography.bodyWeight || 400}`);
    root.style.setProperty('--font-line-height', `${typography.lineHeight || 1.6}`);
    root.style.setProperty('--font-heading-line-height', `${typography.headingLineHeight || 1}`);
    root.style.setProperty('--font-letter-spacing', `${typography.letterSpacing || 0}em`);
    const base = typography.baseSizePx || 16;
    const ratio = typography.scaleRatio || 1.25;
    root.style.setProperty('--font-size-xs', `${base / Math.pow(ratio, 2)}px`);
    root.style.setProperty('--font-size-sm', `${base / ratio}px`);
    root.style.setProperty('--font-size-md', `${base}px`);
    root.style.setProperty('--font-size-lg', `${base * ratio}px`);
    root.style.setProperty('--font-size-xl', `${base * Math.pow(ratio, 2)}px`);
    root.style.setProperty('--font-size-2xl', `${base * Math.pow(ratio, 3)}px`);
    root.style.setProperty('--font-size-3xl', `${base * Math.pow(ratio, 4)}px`);

    // Radius
    root.style.setProperty('--radius-none', radius.none || '0px');
    root.style.setProperty('--radius-sm', radius.sm || '4px');
    root.style.setProperty('--radius-md', radius.md || '8px');
    root.style.setProperty('--radius-lg', radius.lg || '12px');
    root.style.setProperty('--radius-xl', radius.xl || '16px');
    root.style.setProperty('--radius-full', radius.full || '9999px');

    // Layout
    root.style.setProperty('--layout-max-width', `${layout.maxWidthPx || 1200}px`);
    root.style.setProperty('--layout-gap', `${layout.gapPx || 24}px`);
    root.style.setProperty('--layout-padding', `${layout.containerPaddingPx || 24}px`);
    root.style.setProperty('--layout-grid-columns', `${Math.min(6, Math.max(1, layout.gridColumns || 3))}`);
    root.style.setProperty('--layout-grid-style', layout.gridStyle || 'standard');

    // Header
    root.style.setProperty('--header-height', `${header.heightPx || 80}px`);
    root.style.setProperty('--header-bg-opacity', `${Math.min(1, Math.max(0, header.opacity ?? 0.9))}`);
    root.style.setProperty('--header-blur', header.blur ? '12px' : '0px');
    root.style.setProperty('--header-border-display', header.showBorder ? '1px' : '0px');
    root.style.setProperty('--header-name-size', `${header.brandFontSizePx || 24}px`);
    root.style.setProperty('--header-name-weight', `${header.brandWeight || 900}`);
    root.style.setProperty('--header-name-spacing', `${header.brandLetterSpacing ?? -0.05}em`);
    root.style.setProperty('--header-icon-size', `${header.iconSizePx || 28}px`);
    root.style.setProperty('--header-tagline-size', '10px');
    root.style.setProperty('--header-nav-gap', '24px');
    root.style.setProperty('--header-nav-size', `${header.navFontSizePx || 11}px`);
    root.style.setProperty('--header-nav-weight', `${header.navWeight || 700}`);

    // Motion
    if (reducedMotion) {
      root.style.setProperty('--motion-duration-fast', '0ms');
      root.style.setProperty('--motion-duration-normal', '0ms');
      root.style.setProperty('--motion-duration-slow', '0ms');
    } else {
      root.style.setProperty('--motion-duration-fast', `${motion.durationFastMs || 150}ms`);
      root.style.setProperty('--motion-duration-normal', `${motion.durationNormalMs || 300}ms`);
      root.style.setProperty('--motion-duration-slow', `${motion.durationSlowMs || 500}ms`);
    }
    root.style.setProperty('--motion-easing', motion.easing || 'cubic-bezier(0.16, 1, 0.3, 1)');

    const customImage = themeConfig.customImage || '';
    root.style.setProperty('--theme-custom-image', customImage ? `url(\"${customImage.replace(/\"/g, '\\"')}\")` : 'none');

    const loadGoogleFont = (fontStack: string) => {
      const family = fontStack.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
      if (!family) return;
      const id = `google-font-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    };
    loadGoogleFont(typography.fontFamilyHeadings || 'Space Grotesk');
    loadGoogleFont(typography.fontFamilyBody || 'Inter');
    if (header.brandFontFamily?.trim()) loadGoogleFont(header.brandFontFamily);
  }, [themeConfig, reducedMotion]);

  const updateThemeConfig = async (newConfig: ThemeConfig) => {
    const updatedSettings = {
      ...settings,
      theme_config: newConfig,
    };
    setSettings(updatedSettings);
    await portfolioStore.updateSettings({ theme_config: newConfig });
  };

  const handleUpdateSettings = async (newSettings: Partial<PortfolioSettings>) => {
    const updated = await portfolioStore.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        themeConfig,
        loading,
        reducedMotion,
        setReducedMotion,
        updateThemeConfig,
        updateSettings: handleUpdateSettings,
        reloadSettings: loadData,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
