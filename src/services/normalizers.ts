import { InteractionsConfig, NavigationConfig, NavigationItem, P5Layer, P5Place, PortfolioSettings, SiteContent, SiteMedia, ThemeConfig } from '../types/portfolio';
import {
  DEFAULT_NAVIGATION,
  DEFAULT_PORTFOLIO_SETTINGS,
  DEFAULT_SITE_CONTACT,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SITE_MEDIA,
  DEFAULT_THEME_CONFIG,
  DEFAULT_INTERACTIONS,
} from './defaultData';
import { P5_PRESETS, resolveParams } from '../p5/presets';

/** Só aceita textos; qualquer valor estranho salvo no banco cai no texto padrão. */
function mergeStrings<T extends object>(defaults: T, input: unknown): T {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const result = { ...source } as Record<string, unknown>;
  for (const key of Object.keys(defaults)) {
    result[key] = typeof source[key] === "string" ? source[key] : (defaults as Record<string, unknown>)[key];
  }
  return result as T;
}

const P5_PLACES: P5Place[] = ['navbar', 'home', 'projetos', 'sobre', 'contato', 'projeto'];
const MAX_LAYERS = 16;
const MAX_CODE = 60000;

/** Camadas p5.js: qualquer valor estranho salvo no banco vira algo seguro, nunca um erro. */
export function normalizeInteractions(input: unknown): InteractionsConfig {
  const source = (input && typeof input === 'object' ? input : {}) as Partial<InteractionsConfig>;
  const rawLayers = Array.isArray(source.layers) ? source.layers.slice(0, MAX_LAYERS) : [];
  const layers: P5Layer[] = rawLayers
    .filter((l) => l && typeof l === 'object')
    .map((l, index) => {
      const preset = P5_PRESETS.some((p) => p.id === l.preset) ? l.preset : P5_PRESETS[0].id;
      const places = Array.isArray(l.places) ? l.places.filter((p): p is P5Place => P5_PLACES.includes(p as P5Place)) : [];
      const opacity = Number(l.opacity);
      return {
        id: typeof l.id === 'string' && l.id ? l.id.slice(0, 60) : `camada-${index + 1}`,
        name: typeof l.name === 'string' && l.name.trim() ? l.name.slice(0, 80) : `Camada ${index + 1}`,
        enabled: l.enabled !== false,
        places: places.length ? Array.from(new Set(places)) : ['home'],
        depth: l.depth === 'frente' ? 'frente' : 'fundo',
        opacity: Number.isFinite(opacity) ? Math.min(1, Math.max(0.05, opacity)) : 1,
        showOnMobile: l.showOnMobile !== false,
        mode: l.mode === 'code' ? 'code' : 'preset',
        preset,
        params: resolveParams(preset, (l.params && typeof l.params === 'object') ? l.params : {}),
        code: typeof l.code === 'string' ? l.code.slice(0, MAX_CODE) : '',
      };
    });
  return {
    layers,
    animateStars: source.animateStars !== false,
    respectReducedMotion: source.respectReducedMotion !== false,
  };
}

/** Garante que os 3 links existam sempre, uma única vez cada, na ordem salva. */
export function normalizeNavigation(input: unknown): NavigationConfig {
  const source = (input && typeof input === 'object' ? input : {}) as Partial<NavigationConfig>;
  const saved = Array.isArray(source.links) ? source.links : [];
  const seen = new Set<string>();
  const links: NavigationItem[] = [];
  for (const item of saved) {
    const fallback = DEFAULT_NAVIGATION.links.find((link) => link.id === item?.id);
    if (!fallback || seen.has(fallback.id)) continue;
    seen.add(fallback.id);
    links.push({
      id: fallback.id,
      label: typeof item.label === 'string' && item.label.trim() ? item.label : fallback.label,
      visible: item.visible !== false,
    });
  }
  for (const fallback of DEFAULT_NAVIGATION.links) if (!seen.has(fallback.id)) links.push({ ...fallback });
  return {
    ...(source as object),
    links,
    showAdminIcon: source.showAdminIcon !== false,
  } as NavigationConfig;
}

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
    content: mergeStrings<SiteContent>(DEFAULT_SITE_CONTENT, source.content),
    media: mergeStrings<SiteMedia>(DEFAULT_SITE_MEDIA, source.media),
    navigation: normalizeNavigation(source.navigation),
    interactions: normalizeInteractions(source.interactions ?? DEFAULT_INTERACTIONS),
    contact: {
      ...DEFAULT_SITE_CONTACT,
      ...((source.contact as object) || {}),
    },
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
