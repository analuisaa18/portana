import type {
  ButtonVariantDesign, DesignConfig, FontGroupId, FontGroupStyle, PageDesign, PageId, ShadowPreset,
} from '../types/design';
import { safeFamily } from './googleFonts';

/**
 * Converte o DesignConfig (salvo no Supabase) em CSS real do site público.
 * Só gera regra para o que foi definido — design vazio = nenhuma regra = visual original.
 * As regras usam !important + prefixo "html body" para vencer os valores fixos do index.css e as
 * regras de celular do mobile_fix.css sem precisar editá-los.
 */

const MOBILE = '@media (max-width: 767px)';
const P = 'html body';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const color = (v?: string) => (typeof v === 'string' && HEX.test(v.trim()) ? v.trim() : undefined);
const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === 'number' ? v : Number.NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
};

const SHADOWS: Record<ShadowPreset, string> = {
  none: 'none',
  soft: '0 8px 24px rgba(0,0,0,.25)',
  strong: '0 16px 44px rgba(0,0,0,.55)',
};

/** Elementos reais do site que cada grupo tipográfico controla. */
export const FONT_GROUP_SELECTORS: Record<Exclude<FontGroupId, 'main'>, string[]> = {
  headings: ['.ref-home__copy h1', '.ref-projects__title', '.ref-about__copy h1', '.ref-contact__heading h1', '.ref-detail__title', '.ref-detail__state h2'],
  subheadings: ['.ref-home__copy p', '.ref-about__lead', '.ref-contact__card h2', '.ref-contact__heading p', '.ref-contact__heading span', '.ref-detail__lead'],
  body: ['.ref-about__text p', '.ref-contact__info span', '.ref-contact__form label', '.ref-contact__notice', '.ref-projects__empty', '.ref-project-card__meta', '.ref-detail__empty', '.ref-detail__blocks'],
  buttons: ['.ref-cta', '.ref-contact__form button', '.ref-detail__back'],
  navbar: ['.ref-header__brand', '.ref-header__nav button'],
  highlight: ['.ref-project-card__label', '.ref-detail__chip', '.ref-contact__social a', '.ref-contact__info strong'],
};

const sel = (list: string[], suffix = '') => list.map((s) => `${P} ${s}${suffix}`).join(',\n');
const rule = (selector: string, decl: string[]) => (decl.length ? `${selector} { ${decl.join(' ')} }\n` : '');
const mq = (css: string) => (css ? `${MOBILE} {\n${css}}\n` : '');
const d = (prop: string, value: string | number | undefined, unit = '') =>
  value === undefined ? '' : `${prop}:${value}${unit} !important;`;

const familyStack = (family: string) => `"${safeFamily(family)}", sans-serif`;

const fontDecls = (f: FontGroupStyle) => {
  const out: string[] = [];
  if (f.family && safeFamily(f.family)) out.push(d('font-family', familyStack(f.family)));
  const size = num(f.sizePx, 6, 400); if (size !== undefined) out.push(d('font-size', size, 'px'));
  const w = num(f.weight, 100, 900); if (w !== undefined) out.push(d('font-weight', Math.round(w / 100) * 100));
  const lh = num(f.lineHeight, 0.5, 4); if (lh !== undefined) out.push(d('line-height', lh));
  const ls = num(f.letterSpacingEm, -0.5, 1.5); if (ls !== undefined) out.push(d('letter-spacing', ls, 'em'));
  if (f.italic !== undefined) out.push(d('font-style', f.italic ? 'italic' : 'normal'));
  if (f.transform && ['none', 'uppercase', 'lowercase', 'capitalize'].includes(f.transform)) out.push(d('text-transform', f.transform));
  return out.filter(Boolean);
};

const buildFonts = (design: DesignConfig) => {
  let css = '';
  let mobile = '';
  const main = design.fonts.main;
  if (main) {
    const rootVars: string[] = [];
    if (main.family && safeFamily(main.family)) rootVars.push(`--font-body:${familyStack(main.family)};`);
    css += rule(':root', rootVars);
    const decl = fontDecls({ ...main, family: undefined, sizePx: undefined });
    css += rule(`${P}, ${P} .reference-site`, decl);
    const sz = num(main.sizePx, 6, 400);
    if (sz !== undefined) css += rule(`${P} .reference-site`, [d('font-size', sz, 'px')]);
  }
  (Object.keys(FONT_GROUP_SELECTORS) as Array<keyof typeof FONT_GROUP_SELECTORS>).forEach((id) => {
    const f = design.fonts[id];
    if (!f) return;
    const selectors = FONT_GROUP_SELECTORS[id];
    css += rule(sel(selectors), fontDecls(f));
    // Botões e links herdam fonte do pai: reforça nos descendentes de texto.
    const m = num(f.sizeMobilePx, 6, 400);
    if (m !== undefined) mobile += rule(sel(selectors), [d('font-size', m, 'px')]);
  });
  return css + mq(mobile);
};

const buildColors = (design: DesignConfig) => {
  const c = design.colors;
  let css = '';
  const bg = color(c.background);
  if (bg) css += rule(`${P}, ${P} .reference-site, ${P} .reference-main, ${P} .ref-page`, [d('background-color', bg)]);
  const bg2 = color(c.backgroundSecondary);
  if (bg2) css += rule(sel(['.ref-contact__card', '.ref-contact__form input', '.ref-contact__form textarea', '.ref-detail__cover', '.ref-project-card__image']), [d('background-color', bg2)]);

  const titles = color(c.titles);
  if (titles) css += rule(sel(FONT_GROUP_SELECTORS.headings), [d('color', titles)]);
  const text = color(c.text);
  if (text) css += rule(sel(['.ref-about__text', '.ref-about__text p', '.ref-home__copy p', '.ref-contact__info span', '.ref-contact__form label', '.ref-detail__lead', '.ref-projects__empty', '.ref-detail__blocks']), [d('color', text)]);
  const text2 = color(c.textSecondary);
  if (text2) css += rule(sel(['.ref-project-card__meta', '.ref-contact__notice', '.ref-contact__heading span', '.ref-detail__empty']), [d('color', text2)]);
  const hl = color(c.highlight);
  if (hl) css += rule(sel(['.ref-project-card__label', '.ref-detail__chip', '.ref-contact__card h2', '.ref-contact__info strong', '.ref-about__lead', '.ref-header__nav button:hover', '.ref-header__nav button[aria-current="page"]']), [d('color', hl)]);

  const btn = color(c.button);
  const btnText = color(c.buttonText);
  const btnSel = sel(['.ref-cta', '.ref-cta--pink', '.ref-contact__form button']);
  if (btn || btnText) css += rule(btnSel, [d('background', btn), d('color', btnText)].filter(Boolean));

  const border = color(c.border);
  if (border) css += rule(sel(['.ref-contact__card', '.ref-contact__social a', '.ref-detail__chip']), [d('border-color', border)]);
  const link = color(c.link);
  if (link) css += rule(sel(['.ref-contact__info a', '.ref-contact__social a']), [d('color', link)]);

  const nav = color(c.navbar);
  if (nav) css += rule(sel(['.ref-header__inner']), [d('background-color', nav)]);
  const navText = color(c.navbarText);
  if (navText) css += rule(sel(['.ref-header__brand', '.ref-header__asterisk', '.ref-header__nav button', '.ref-header__nav a', '.ref-header__social']), [d('color', navText)]);
  const navActive = color(c.navbarActive);
  if (navActive) css += rule(sel(['.ref-header__nav button:hover', '.ref-header__nav button[aria-current="page"]', '.ref-header__nav .ref-header__social:hover']), [d('color', navActive)]);

  const deco = color(c.decorative);
  if (deco) css += rule(sel(['.ref-header__decor', '.ref-header__asterisk']), [d('color', deco)]);
  const stars = color(c.stars);
  if (stars) {
    css += rule(sel(['.ref-star']), [d('color', stars)]);
    css += rule(`${P} .istar path`, [d('fill', stars)]);
  }

  const sections: Array<[string | undefined, string]> = [
    [c.sectionHome, '.ref-page--home'], [c.sectionAbout, '.ref-page--about'], [c.sectionProjects, '.ref-page--projects'],
    [c.sectionContact, '.ref-page--contact'], [c.sectionDetail, '.ref-page--detail'],
  ];
  for (const [value, selector] of sections) {
    const v = color(value);
    // Cor de seção = fundo sólido (substitui a textura daquela página).
    if (v) css += rule(`${P} ${selector}`, [d('background-image', 'none'), d('background-color', v)]);
  }
  return css;
};

const buildNavbar = (design: DesignConfig) => {
  const n = design.navbar;
  const navBg = color(design.colors.navbar) || '#050505';
  let css = '';
  let mobile = '';
  const outer: string[] = [];
  const inner: string[] = [];
  const widthPct = num(n.widthPct, 40, 100); if (widthPct !== undefined) outer.push(d('width', widthPct, '%'));
  const top = num(n.topPx, 0, 200); if (top !== undefined) outer.push(d('top', top, 'px'));
  css += rule(sel(['.ref-header']), outer.filter(Boolean));

  const opacity = num(n.opacity, 0, 1);
  if (opacity !== undefined) {
    const hex = navBg.length === 4 ? `#${[...navBg.slice(1)].map((ch) => ch + ch).join('')}` : navBg;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    inner.push(d('background', `rgba(${r},${g},${b},${opacity})`));
  }
  const h = num(n.heightPx, 40, 220); if (h !== undefined) inner.push(d('height', h, 'px'));
  const px = num(n.paddingXPx, 0, 200); if (px !== undefined) inner.push(d('padding-left', px, 'px'), d('padding-right', px, 'px'));
  const bw = num(n.borderWidthPx, 0, 12); if (bw !== undefined) inner.push(d('border-width', bw, 'px'));
  const bc = color(n.borderColor); if (bc) inner.push(d('border-color', bc));
  const r = num(n.radiusPx, 0, 999); if (r !== undefined) inner.push(d('border-radius', r, 'px'));
  if (n.shadow && SHADOWS[n.shadow]) inner.push(d('box-shadow', SHADOWS[n.shadow]));
  const blur = num(n.blurPx, 0, 40); if (blur !== undefined) inner.push(d('backdrop-filter', `blur(${blur}px)`));
  css += rule(sel(['.ref-header__inner']), inner.filter(Boolean));

  const gap = num(n.navGapPx, 0, 160); if (gap !== undefined) css += rule(sel(['.ref-header__nav']), [d('gap', gap, 'px')]);
  const brand = num(n.brandSizePx, 8, 60); if (brand !== undefined) css += rule(sel(['.ref-header__brand']), [d('font-size', brand, 'px')]);

  // Itens individuais (por posição) — só aparência; os destinos dos links não são tocados.
  Object.entries(n.items || {}).forEach(([idx, item]) => {
    const i = Math.round(Number(idx));
    if (!Number.isFinite(i) || i < 1 || i > 12 || !item) return;
    const decl = [d('color', color(item.color)), d('font-weight', num(item.weight, 100, 900)), d('font-size', num(item.sizePx, 6, 60), 'px')].filter(Boolean);
    // color:undefined vira '' mas d() com undefined retorna '' — filtrado acima.
    css += rule(`${P} .ref-header__nav button:nth-of-type(${i})`, decl);
  });

  // Mobile
  const mh = num(n.heightMobilePx, 40, 260); if (mh !== undefined) mobile += rule(sel(['.ref-header__inner']), [d('height', mh, 'px'), d('min-height', mh, 'px')]);
  const mt = num(n.topMobilePx, 0, 120); if (mt !== undefined) mobile += rule(sel(['.ref-header']), [d('top', mt, 'px')]);
  const mg = num(n.navGapMobilePx, 0, 100); if (mg !== undefined) mobile += rule(sel(['.ref-header__nav']), [d('gap', mg, 'px')]);
  const ms = num(n.navSizeMobilePx, 6, 40); if (ms !== undefined) mobile += rule(sel(['.ref-header__nav button']), [d('font-size', ms, 'px')]);
  const mb = num(n.brandSizeMobilePx, 8, 40); if (mb !== undefined) mobile += rule(sel(['.ref-header__brand']), [d('font-size', mb, 'px')]);
  if (n.hideDecorOnMobile) mobile += rule(sel(['.ref-header__decor', '.istars--navbar']), [d('display', 'none')]);
  return css + mq(mobile);
};

const buildButtons = (design: DesignConfig) => {
  const variants: Record<string, { selector: string; hover: string }> = {
    primary: { selector: '.ref-cta:not(.ref-cta--pink)', hover: '.ref-cta:not(.ref-cta--pink):hover' },
    accent: { selector: '.ref-cta--pink', hover: '.ref-cta--pink:hover' },
    submit: { selector: '.ref-contact__form button', hover: '.ref-contact__form button:hover' },
  };
  let css = '';
  (Object.keys(variants) as Array<keyof typeof variants>).forEach((id) => {
    const b: ButtonVariantDesign | undefined = design.buttons[id as keyof DesignConfig['buttons']];
    if (!b) return;
    const v = variants[id];
    const decl = [
      d('background', color(b.background)), d('color', color(b.color)),
      d('border-style', num(b.borderWidthPx, 0, 12) !== undefined ? 'solid' : undefined),
      d('border-width', num(b.borderWidthPx, 0, 12), 'px'), d('border-color', color(b.borderColor)),
      d('border-radius', num(b.radiusPx, 0, 999), 'px'), d('font-size', num(b.sizePx, 6, 60), 'px'),
      d('font-weight', num(b.weight, 100, 900)),
      d('padding-top', num(b.paddingYPx, 0, 80), 'px'), d('padding-bottom', num(b.paddingYPx, 0, 80), 'px'),
      d('padding-left', num(b.paddingXPx, 0, 160), 'px'), d('padding-right', num(b.paddingXPx, 0, 160), 'px'),
      d('min-height', num(b.minHeightPx, 0, 200), 'px'), d('min-width', num(b.minWidthPx, 0, 600), 'px'),
      b.shadow && SHADOWS[b.shadow] ? d('box-shadow', SHADOWS[b.shadow]) : '',
      d('transition-duration', num(b.transitionMs, 0, 2000), 'ms'),
    ].filter(Boolean);
    css += rule(sel([v.selector]), decl);
    const lift = num(b.hoverLiftPx, 0, 30);
    const hov = [
      d('background', color(b.hoverBackground)), d('color', color(b.hoverColor)),
      lift !== undefined ? d('transform', `translateY(${-lift}px)`) : '',
    ].filter(Boolean);
    css += rule(sel([v.hover]), hov);
  });
  return css;
};

interface PageMap { page: string; title: string[]; text: string[]; cards?: string[]; grid?: string; copy?: string; border?: string[]; accent?: string[] }
const PAGES: Record<PageId, PageMap> = {
  home: { page: '.ref-page--home', title: ['.ref-home__copy h1'], text: ['.ref-home__copy p'], copy: '.ref-home__copy' },
  about: { page: '.ref-page--about', title: ['.ref-about__copy h1'], text: ['.ref-about__text p', '.ref-about__lead'], cards: ['.ref-about__visual'], copy: '.ref-about__copy', accent: ['.ref-about__lead'] },
  projects: { page: '.ref-page--projects', title: ['.ref-projects__title'], text: ['.ref-project-card__meta', '.ref-projects__empty'], cards: ['.ref-project-card__image'], grid: '.ref-projects__grid', accent: ['.ref-project-card__label'] },
  contact: { page: '.ref-page--contact', title: ['.ref-contact__heading h1'], text: ['.ref-contact__info span', '.ref-contact__form label', '.ref-contact__heading span'], cards: ['.ref-contact__card'], border: ['.ref-contact__card', '.ref-contact__social a'], accent: ['.ref-contact__card h2'] },
  detail: { page: '.ref-page--detail', title: ['.ref-detail__title'], text: ['.ref-detail__lead'], cards: ['.ref-detail__cover'], border: ['.ref-detail__chip'], accent: ['.ref-detail__chip'] },
};

const buildPages = (design: DesignConfig) => {
  let css = '';
  let mobile = '';
  (Object.keys(PAGES) as PageId[]).forEach((id) => {
    const pg: PageDesign | undefined = design.pages[id];
    if (!pg) return;
    const m = PAGES[id];
    const bg = color(pg.background);
    if (bg) css += rule(`${P} ${m.page}`, [d('background-image', 'none'), d('background-color', bg)]);
    const tc = color(pg.titleColor); if (tc) css += rule(sel(m.title), [d('color', tc)]);
    const xc = color(pg.textColor); if (xc) css += rule(sel(m.text), [d('color', xc)]);
    const ac = color(pg.accentColor); if (ac && m.accent) css += rule(sel(m.accent), [d('color', ac)]);
    css += rule(sel(m.title), [d('font-size', num(pg.titleSizePx, 10, 400), 'px'), d('font-weight', num(pg.titleWeight, 100, 900))].filter(Boolean));
    css += rule(sel(m.text), [d('font-size', num(pg.textSizePx, 6, 120), 'px')].filter(Boolean));
    const pad = [
      d('padding-top', num(pg.paddingTopPx, 0, 600), 'px'), d('padding-bottom', num(pg.paddingBottomPx, 0, 600), 'px'),
      pg.paddingXPct !== undefined ? d('padding-left', num(pg.paddingXPct, 0, 30), '%') + d('padding-right', num(pg.paddingXPct, 0, 30), '%') : '',
    ].filter(Boolean);
    css += rule(`${P} ${m.page}`, pad);
    if (pg.align && ['left', 'center', 'right'].includes(pg.align)) css += rule(sel(m.copy ? [m.copy] : [m.page]), [d('text-align', pg.align)]);
    const gap = num(pg.gapPx, 0, 200); if (gap !== undefined && m.grid) css += rule(sel([m.grid]), [d('gap', gap, 'px')]);
    const rad = num(pg.radiusPx, 0, 200); if (rad !== undefined && m.cards) css += rule(sel(m.cards), [d('border-radius', rad, 'px')]);
    const bc = color(pg.borderColor); if (bc && m.border) css += rule(sel(m.border), [d('border-color', bc)]);
    const ox = num(pg.offsetXPx, -600, 600), oy = num(pg.offsetYPx, -600, 600);
    if ((ox !== undefined || oy !== undefined) && m.copy) css += rule(sel([m.copy]), [d('translate', `${ox ?? 0}px ${oy ?? 0}px`)]);

    mobile += rule(sel(m.title), [d('font-size', num(pg.titleSizeMobilePx, 10, 300), 'px')].filter(Boolean));
    mobile += rule(sel(m.text), [d('font-size', num(pg.textSizeMobilePx, 6, 100), 'px')].filter(Boolean));
    mobile += rule(`${P} ${m.page}`, [d('padding-top', num(pg.paddingTopMobilePx, 0, 500), 'px')].filter(Boolean));
  });
  return css + mq(mobile);
};

/** CSS completo do design. Vazio quando nada foi personalizado. */
export const buildDesignCss = (design?: DesignConfig | null): string => {
  if (!design) return '';
  const safe: DesignConfig = {
    version: 1,
    fonts: design.fonts || {}, colors: design.colors || {}, navbar: design.navbar || {},
    buttons: design.buttons || {}, pages: design.pages || {},
  };
  // Ordem importa: cores globais → botões/ navbar/ páginas (mais específicos vencem depois).
  return buildFonts(safe) + buildColors(safe) + buildNavbar(safe) + buttonsAfter(safe) + buildPages(safe);
};
const buttonsAfter = (design: DesignConfig) => buildButtons(design);

/** Famílias que o site precisa carregar (com os pesos reais escolhidos). */
export const designFontRequests = (design?: DesignConfig | null) => {
  const map = new Map<string, { weights: Set<number>; italic: boolean }>();
  Object.values(design?.fonts || {}).forEach((f) => {
    if (!f?.family || !safeFamily(f.family)) return;
    const key = safeFamily(f.family);
    const entry = map.get(key) || { weights: new Set<number>(), italic: false };
    (f.availableWeights?.length ? f.availableWeights : [400, 700, 900]).forEach((w) => entry.weights.add(w));
    if (f.weight) entry.weights.add(f.weight);
    if (f.italic && f.hasItalic !== false) entry.italic = true;
    map.set(key, entry);
  });
  return Array.from(map.entries()).map(([family, v]) => ({ family, weights: Array.from(v.weights), italic: v.italic }));
};
