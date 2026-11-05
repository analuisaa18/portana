import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';
import { useSiteContent } from '../public/siteContent';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const { navigation } = useSiteContent();
  const brand = settings.portfolio_name || 'Portfólio';
  const links = navigation.links.filter((item) => item.visible);

  return (
    <>
      <SkipLink />
      <header className="ref-header">
        <div className="ref-header__inner">
          <button className="ref-header__brand" type="button" onClick={() => onNavigate('home')}>
            <span className="ref-header__asterisk" aria-hidden="true">✦</span>
            <span>{brand}</span>
          </button>

          <nav className="ref-header__nav" aria-label="Navegação principal">
            {links.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
            {/* Último ícone: acesso à área administrativa (sempre leva a #/admin). */}
            {navigation.showAdminIcon !== false && (
              <button
                type="button"
                className="ref-header__social"
                onClick={() => onNavigate('admin')}
                aria-label="Área administrativa"
                title="Área administrativa"
                aria-current={currentView === 'admin' ? 'page' : undefined}
              >
                <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
            )}
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
