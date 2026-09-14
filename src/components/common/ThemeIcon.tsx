import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeIcon as ThemeIconConfig } from '../../types/portfolio';

const iconUrl = (icon: ThemeIconConfig) => {
  if (icon.provider === 'custom' && icon.url) return icon.url;
  const collection = icon.provider === 'material'
    ? 'material-symbols'
    : icon.provider === 'apple'
      ? 'simple-icons'
      : icon.provider === 'feather'
        ? 'feather'
        : '';
  if (!collection || !icon.name) return '';
  return `https://api.iconify.design/${collection}:${encodeURIComponent(icon.name)}.svg?color=currentColor`;
};

export const ThemeIcon: React.FC<{ icon?: ThemeIconConfig; className?: string; style?: React.CSSProperties }> = ({ icon, className = 'w-5 h-5', style }) => {
  if (!icon) return <Sparkles className={className} style={style} />;
  if (icon.provider === 'lucide') {
    const Icon = (Sparkles as React.ComponentType<any>);
    return <Icon className={className} style={style} aria-hidden="true" />;
  }
  const src = iconUrl(icon);
  if (!src) return <Sparkles className={className} />;
  return <img src={src} alt={icon.alt || ''} className={`${className} object-contain`} style={style} aria-hidden={!icon.alt} />;
};
