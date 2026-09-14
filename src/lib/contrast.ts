/**
 * Helper utilities for calculating WCAG 2.2 color contrast ratios.
 */

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return null;

  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Calculate relative luminance for an sRGB component
function relativeLuminanceComponent(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

// Calculate total relative luminance
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const r = relativeLuminanceComponent(rgb.r);
  const g = relativeLuminanceComponent(rgb.g);
  const b = relativeLuminanceComponent(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two hex colors
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastAuditResult {
  pair: string;
  fgToken: string;
  bgToken: string;
  fgColor: string;
  bgColor: string;
  ratio: number;
  passesAA: boolean;       // >= 4.5:1
  passesAALarge: boolean;  // >= 3.0:1
  warning?: string;
}

export function auditThemeContrast(colors: {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  focus: string;
}): ContrastAuditResult[] {
  const results: ContrastAuditResult[] = [];

  // Pair 1: Text Primary on Background
  const ratio1 = getContrastRatio(colors.textPrimary, colors.background);
  results.push({
    pair: 'Texto Principal sobre Fundo',
    fgToken: 'textPrimary',
    bgToken: 'background',
    fgColor: colors.textPrimary,
    bgColor: colors.background,
    ratio: Math.round(ratio1 * 100) / 100,
    passesAA: ratio1 >= 4.5,
    passesAALarge: ratio1 >= 3.0,
    warning: ratio1 < 4.5 ? 'Baixo contraste. O texto principal pode ficar difícil de ler para pessoas com baixa visão.' : undefined,
  });

  // Pair 2: Text Secondary on Background
  const ratio2 = getContrastRatio(colors.textSecondary, colors.background);
  results.push({
    pair: 'Texto Secundário sobre Fundo',
    fgToken: 'textSecondary',
    bgToken: 'background',
    fgColor: colors.textSecondary,
    bgColor: colors.background,
    ratio: Math.round(ratio2 * 100) / 100,
    passesAA: ratio2 >= 4.5,
    passesAALarge: ratio2 >= 3.0,
    warning: ratio2 < 4.5 ? 'Texto secundário com contraste insuficiente (< 4.5:1).' : undefined,
  });

  // Pair 3: Primary Accent / Button Text on Surface
  const ratio3 = getContrastRatio(colors.primary, colors.surface);
  results.push({
    pair: 'Cor Primária sobre Superfície (Cartões/Bordas)',
    fgToken: 'primary',
    bgToken: 'surface',
    fgColor: colors.primary,
    bgColor: colors.surface,
    ratio: Math.round(ratio3 * 100) / 100,
    passesAA: ratio3 >= 4.5,
    passesAALarge: ratio3 >= 3.0,
    warning: ratio3 < 3.0 ? 'A cor primária não tem destaque suficiente sobre os cartões (< 3.0:1).' : undefined,
  });

  // Pair 4: Focus indicator on Background
  const ratio4 = getContrastRatio(colors.focus, colors.background);
  results.push({
    pair: 'Indicador de Foco sobre Fundo',
    fgToken: 'focus',
    bgToken: 'background',
    fgColor: colors.focus,
    bgColor: colors.background,
    ratio: Math.round(ratio4 * 100) / 100,
    passesAA: ratio4 >= 3.0,
    passesAALarge: ratio4 >= 3.0,
    warning: ratio4 < 3.0 ? 'O anel de foco teclado não se destaca o suficiente no fundo (< 3.0:1).' : undefined,
  });

  return results;
}
