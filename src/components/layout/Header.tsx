import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';
import { DEFAULT_NAVIGATION } from '../../services/defaultData';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings, themeConfig } = useTheme();
  const brand = settings.portfolio_name || 'Portfólio';

  const rawNav = themeConfig.navigation?.links;
  const nav = (Array.isArray(rawNav) ? rawNav : DEFAULT_NAVIGATION.links).filter(item => item && item.visible && typeof item.id === 'string');

  return (
    <>
      <SkipLink />
      <header className="ref-header" style={{
        ...({
          '--navbar-height': `${themeConfig.navigation?.heightDesktopPx ?? 94}px`,
          '--navbar-height-mobile': `${themeConfig.navigation?.heightMobilePx ?? 82}px`,
          '--navbar-brand-size': `${themeConfig.navigation?.brandSizeDesktopPx ?? 13}px`,
          '--navbar-brand-size-mobile': `${themeConfig.navigation?.brandSizeMobilePx ?? 11}px`,
          '--navbar-nav-size': `${themeConfig.navigation?.navSizeDesktopPx ?? 10}px`,
          '--navbar-nav-size-mobile': `${themeConfig.navigation?.navSizeMobilePx ?? 7}px`,
          '--navbar-gap': `${themeConfig.navigation?.gapDesktopPx ?? 36}px`,
          '--navbar-gap-mobile': `${themeConfig.navigation?.gapMobilePx ?? 13}px`,
        } as React.CSSProperties),
      }}>
        <div className="ref-header__inner">
          <button className="ref-header__brand" type="button" onClick={() => onNavigate('home')} style={{ fontFamily: 'var(--font-headings)' }}>
            <span className="ref-header__asterisk" aria-hidden="true">✦</span>
            <span>{brand}</span>
          </button>

          <nav className="ref-header__nav" aria-label="Navegação principal">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              aria-label="Área de Administração"
              className="ref-header__social cursor-pointer"
              title="Acessar Área Administrativa"
            >
              <Shield size={14} strokeWidth={1.7} />
            </button>
          </nav>

          <span className="ref-header__decor ref-header__decor--1" aria-hidden="true">✦</span>
          <span className="ref-header__decor ref-header__decor--2" aria-hidden="true">✧</span>
          <span className="ref-header__decor ref-header__decor--3" aria-hidden="true">✦</span>
          <span className="ref-header__decor ref-header__decor--4" aria-hidden="true">✧</span>
        </div>
      </header>
    </>
  );
};
