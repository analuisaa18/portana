import { PortfolioSettings, ThemeConfig } from '../types/portfolio';
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_THEME_CONFIG, DEFAULT_SITE_CONTENT, DEFAULT_SITE_MEDIA, DEFAULT_NAVIGATION, DEFAULT_SITE_CONTACT, DEFAULT_P5_CONFIG } from './defaultData';

/**
 * Completa configurações antigas/parciais sem apagar valores válidos como false, 0 ou ''.
 * Isso evita que um campo novo do Design System faça o restante voltar para o tema-base.
 */
export function normalizeThemeConfig(input?: Partial<ThemeConfig> | null): ThemeConfig {
  const source = input || {};

  return {
    ...DEFAULT_THEME_CONFIG,
    ...source,
    colors: {
      ...DEFAULT_THEME_CONFIG.colors,
      ...(source.colors || {}),
    },
    typography: {
      ...DEFAULT_THEME_CONFIG.typography,
      ...(source.typography || {}),
      selectedWeights: Array.isArray(source.typography?.selectedWeights)
        ? source.typography.selectedWeights.filter((weight): weight is number => typeof weight === 'number' && Number.isFinite(weight) && weight >= 100 && weight <= 900)
        : DEFAULT_THEME_CONFIG.typography.selectedWeights,
      lab: {
        ...(DEFAULT_THEME_CONFIG.typography.lab || {
          text: '3D TICKER',
          speed: 1,
          depth: 28,
          perspective: 900,
          curvature: 18,
          spacing: 4,
          rotateX: -12,
          rotateY: 0,
          rotateZ: 0,
          mouseStrength: 0.7,
          autoRotate: true,
        }),
        ...((source.typography as ThemeConfig['typography'] | undefined)?.lab || {}),
      },
    },
    radius: {
      ...DEFAULT_THEME_CONFIG.radius,
      ...(source.radius || {}),
    },
    layout: {
      ...DEFAULT_THEME_CONFIG.layout,
      ...(source.layout || {}),
    },
    motion: {
      ...DEFAULT_THEME_CONFIG.motion,
      ...(source.motion || {}),
    },
    header: {
      ...DEFAULT_THEME_CONFIG.header,
      ...(source.header || {}),
    },
    brandIcon: {
      ...DEFAULT_THEME_CONFIG.brandIcon,
      ...(source.brandIcon || {}),
    },
    customImage: source.customImage ?? DEFAULT_THEME_CONFIG.customImage,
    ctaLabel: source.ctaLabel ?? DEFAULT_THEME_CONFIG.ctaLabel,
    uxVoice: source.uxVoice ?? DEFAULT_THEME_CONFIG.uxVoice,
    content: Object.fromEntries(Object.entries(DEFAULT_SITE_CONTENT).map(([key, fallback]) => {
      const value = source.content?.[key as keyof typeof DEFAULT_SITE_CONTENT];
      return [key, typeof value === 'string' ? value : fallback];
    })) as ThemeConfig['content'],
    media: { ...DEFAULT_SITE_MEDIA, ...(source.media || {}) },
    navigation: { ...DEFAULT_NAVIGATION, ...(source.navigation || {}),
      links: Array.isArray(source.navigation?.links) && source.navigation.links.length
        ? source.navigation.links.filter(item => item && typeof item.id === 'string' && typeof item.label === 'string')
        : DEFAULT_NAVIGATION.links },
    contact: { ...DEFAULT_SITE_CONTACT, ...(source.contact || {}) },
    p5: { ...DEFAULT_P5_CONFIG, ...(source.p5 || {}) },
  };
}

export function normalizePortfolioSettings(input?: Partial<PortfolioSettings> | null): PortfolioSettings {
  const source = input || {};

  return {
    ...DEFAULT_PORTFOLIO_SETTINGS,
    ...source,
    social_links: source.social_links ?? DEFAULT_PORTFOLIO_SETTINGS.social_links,
    theme_config: normalizeThemeConfig(source.theme_config),
  };
}
