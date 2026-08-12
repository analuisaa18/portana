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
