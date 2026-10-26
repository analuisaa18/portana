import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const brand = settings.portfolio_name || 'Portfólio';

  const nav = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];

  return (
    <>
      <SkipLink />
      <header className="ref-header">
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
