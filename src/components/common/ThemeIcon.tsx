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

export const ThemeIcon: React.FC<{ icon?: ThemeIconConfig; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  if (!icon) return <Sparkles className={className} />;
  if (icon.provider === 'lucide') {
    const Icon = (Sparkles as React.ComponentType<any>);
    return <Icon className={className} aria-hidden="true" />;
  }
  const src = iconUrl(icon);
  if (!src) return <Sparkles className={className} />;
  return <img src={src} alt={icon.alt || ''} className={`${className} object-contain`} aria-hidden={!icon.alt} />;
};
