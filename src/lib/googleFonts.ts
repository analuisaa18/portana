/**
 * Integração com o catálogo do Google Fonts — MESMA fonte de dados que já era usada pelo
 * AppearanceEditor (espelho oficial "fontsource/google-font-metadata" no jsDelivr, sem chave de API),
 * agora com os pesos/estilos reais de cada família para montar a URL de carregamento correta.
 */

export interface GoogleFontMeta {
  family: string;
  weights: number[];
  hasItalic: boolean;
}

export const GOOGLE_FONTS_CATALOG_URL =
  'https://cdn.jsdelivr.net/gh/fontsource/google-font-metadata@main/data/google-fonts-v1.json';

const FALLBACK_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Raleway', 'Oswald',
  'Merriweather', 'Playfair Display', 'Source Sans 3', 'Space Grotesk', 'Plus Jakarta Sans', 'DM Sans',
  'Manrope', 'Outfit', 'Work Sans', 'Figtree', 'Rubik', 'Bebas Neue', 'Archivo', 'Barlow',
  'IBM Plex Sans', 'IBM Plex Serif', 'JetBrains Mono', 'Roboto Mono', 'Syne', 'Lilita One',
];

const FALLBACK: GoogleFontMeta[] = FALLBACK_FAMILIES.map((family) => ({
  family,
  weights: [400, 700],
  hasItalic: false,
}));

let catalogPromise: Promise<GoogleFontMeta[]> | null = null;

export const parseGoogleFontsCatalog = (raw: unknown): GoogleFontMeta[] => {
  const items: any[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? ((raw as any).familyMetadataList || (raw as any).items || Object.values(raw as object))
      : [];
  const byFamily = new Map<string, GoogleFontMeta>();
  for (const item of items) {
    const family = typeof item === 'string' ? item : item?.family || item?.name;
    if (typeof family !== 'string' || !family.trim()) continue;
    const weights = Array.isArray(item?.weights)
      ? item.weights.map((w: unknown) => Number(w)).filter((w: number) => w >= 100 && w <= 900)
      : [];
    const styles: string[] = Array.isArray(item?.styles) ? item.styles : [];
    byFamily.set(family, {
      family,
      weights: weights.length ? Array.from(new Set<number>(weights)).sort((a, b) => a - b) : [400, 700],
      hasItalic: styles.includes('italic'),
    });
  }
  // Mantém fontes importantes disponíveis mesmo se o espelho estiver defasado.
  for (const fb of FALLBACK) if (!byFamily.has(fb.family)) byFamily.set(fb.family, fb);
  return Array.from(byFamily.values()).sort((a, b) => a.family.localeCompare(b.family));
};

export const loadGoogleFontsCatalog = (): Promise<GoogleFontMeta[]> => {
  if (!catalogPromise) {
    catalogPromise = fetch(GOOGLE_FONTS_CATALOG_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Catálogo do Google Fonts indisponível (${r.status})`);
        return r.json();
      })
      .then(parseGoogleFontsCatalog)
      .catch((err) => {
        catalogPromise = null; // permite tentar de novo
        throw err;
      });
  }
  return catalogPromise;
};

/** Primeira família de uma pilha CSS ("Inter, sans-serif" -> "Inter"). */
export const firstFamily = (stack: string) => stack.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

/** Só caracteres seguros: o nome vai parar em CSS e em URL. */
export const safeFamily = (family: string) => family.replace(/[^A-Za-z0-9 \-]/g, '').trim();

export const googleFontHref = (family: string, weights: number[], italic: boolean) => {
  const fam = encodeURIComponent(safeFamily(family)).replace(/%20/g, '+');
  const ws = Array.from(new Set(weights.filter((w) => w >= 100 && w <= 900))).sort((a, b) => a - b);
  const list = ws.length ? ws : [400, 700];
  const axis = italic
    ? `ital,wght@${list.map((w) => `0,${w}`).concat(list.map((w) => `1,${w}`)).join(';')}`
    : `wght@${list.join(';')}`;
  return `https://fonts.googleapis.com/css2?family=${fam}:${axis}&display=swap`;
};

/** Injeta (ou atualiza) o <link> da família com exatamente os pesos pedidos. */
export const ensureGoogleFont = (family: string, weights: number[], italic = false) => {
  const clean = safeFamily(family);
  if (!clean || typeof document === 'undefined') return;
  const id = `pf-font-${clean.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const href = googleFontHref(clean, weights, italic);
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};
