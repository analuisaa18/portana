/**
 * Design System editável pelo Admin (aba "Editor Visual").
 *
 * Fica dentro de theme_config (JSONB) no Supabase — a mesma e única fonte de verdade do tema.
 * Todo campo é OPCIONAL: campo ausente = "usar o visual atual do site". Por isso o estado
 * inicial (design vazio) reproduz exatamente o portfólio original; só o que for definido no
 * Admin gera CSS (ver src/lib/designCss.ts).
 */

export type FontGroupId = 'main' | 'headings' | 'subheadings' | 'body' | 'buttons' | 'navbar' | 'highlight';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type ShadowPreset = 'none' | 'soft' | 'strong';
export type PageId = 'home' | 'about' | 'projects' | 'contact' | 'detail';
export type ButtonVariantId = 'primary' | 'accent' | 'submit';

export interface FontGroupStyle {
  /** Família do Google Fonts (ex.: "Lilita One"). */
  family?: string;
  /** Pesos que a família realmente possui (vindos do catálogo no momento da escolha). */
  availableWeights?: number[];
  hasItalic?: boolean;
  sizePx?: number;
  sizeMobilePx?: number;
  weight?: number;
  lineHeight?: number;
  letterSpacingEm?: number;
  italic?: boolean;
  transform?: TextTransform;
}

export interface DesignColors {
  background?: string;
  backgroundSecondary?: string;
  titles?: string;
  text?: string;
  textSecondary?: string;
  highlight?: string;
  button?: string;
  buttonText?: string;
  border?: string;
  link?: string;
  navbar?: string;
  navbarText?: string;
  navbarActive?: string;
  decorative?: string;
  stars?: string;
  sectionHome?: string;
  sectionAbout?: string;
  sectionProjects?: string;
  sectionContact?: string;
  sectionDetail?: string;
}

export interface NavbarItemDesign {
  color?: string;
  weight?: number;
  sizePx?: number;
}

export interface NavbarDesign {
  opacity?: number;
  heightPx?: number;
  heightMobilePx?: number;
  widthPct?: number;
  topPx?: number;
  topMobilePx?: number;
  paddingXPx?: number;
  borderWidthPx?: number;
  borderColor?: string;
  radiusPx?: number;
  shadow?: ShadowPreset;
  blurPx?: number;
  navGapPx?: number;
  navGapMobilePx?: number;
  navSizeMobilePx?: number;
  brandSizePx?: number;
  brandSizeMobilePx?: number;
  hideDecorOnMobile?: boolean;
  /** Personalização individual dos itens (por posição: 1, 2, 3…). Não altera destino dos links. */
  items?: Record<string, NavbarItemDesign>;
}

export interface ButtonVariantDesign {
  background?: string;
  color?: string;
  borderColor?: string;
  borderWidthPx?: number;
  radiusPx?: number;
  sizePx?: number;
  weight?: number;
  paddingYPx?: number;
  paddingXPx?: number;
  minHeightPx?: number;
  minWidthPx?: number;
  shadow?: ShadowPreset;
  hoverBackground?: string;
  hoverColor?: string;
  hoverLiftPx?: number;
  transitionMs?: number;
}

export interface PageDesign {
  background?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  titleSizePx?: number;
  titleSizeMobilePx?: number;
  titleWeight?: number;
  textSizePx?: number;
  textSizeMobilePx?: number;
  paddingTopPx?: number;
  paddingTopMobilePx?: number;
  paddingBottomPx?: number;
  paddingXPct?: number;
  align?: 'left' | 'center' | 'right';
  gapPx?: number;
  radiusPx?: number;
  borderColor?: string;
  /** Home: deslocamento do bloco de texto (não altera o layout-base). */
  offsetXPx?: number;
  offsetYPx?: number;
}

export interface DesignConfig {
  version: 1;
  fonts: Partial<Record<FontGroupId, FontGroupStyle>>;
  colors: DesignColors;
  navbar: NavbarDesign;
  buttons: Partial<Record<ButtonVariantId, ButtonVariantDesign>>;
  pages: Partial<Record<PageId, PageDesign>>;
}

export const EMPTY_DESIGN: DesignConfig = {
  version: 1,
  fonts: {},
  colors: {},
  navbar: {},
  buttons: {},
  pages: {},
};
