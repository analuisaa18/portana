import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  DEFAULT_NAVIGATION,
  DEFAULT_SITE_CONTACT,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SITE_MEDIA,
} from '../../services/defaultData';

/** Conteúdo editável do site, sempre completo (cai no padrão se algo faltar). */
export function useSiteContent() {
  const { themeConfig } = useTheme();
  return {
    text: { ...DEFAULT_SITE_CONTENT, ...(themeConfig.content || {}) },
    media: { ...DEFAULT_SITE_MEDIA, ...(themeConfig.media || {}) },
    navigation: themeConfig.navigation || DEFAULT_NAVIGATION,
    contact: { ...DEFAULT_SITE_CONTACT, ...(themeConfig.contact || {}) },
  };
}

/** Mostra quebras de linha digitadas no painel (Enter) como quebras reais. */
export const MultiLine: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('\n').map((line, index, all) => (
      <React.Fragment key={index}>
        {line}
        {index < all.length - 1 && <br />}
      </React.Fragment>
    ))}
  </>
);

const cssUrl = (url: string) => `url("${url.replace(/"/g, '%22')}")`;

/**
 * Troca a camada de papel do fundo sem mexer na textura preta de base.
 * Campos vazios mantêm as imagens originais definidas no CSS.
 */
export function backgroundVars(desktop?: string, mobile?: string): React.CSSProperties {
  const style: Record<string, string> = {};
  if (desktop?.trim()) style['--bg-top'] = cssUrl(desktop.trim());
  const mobileUrl = mobile?.trim() || desktop?.trim();
  if (mobileUrl) style['--bg-top-mobile'] = cssUrl(mobileUrl);
  return style as React.CSSProperties;
}
