import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

const stars = [
  { left: '7%', top: '42%', size: 16, delay: '0s', duration: '6.5s' },
  { left: '29%', top: '18%', size: 8, delay: '-2s', duration: '7.5s' },
  { left: '53%', top: '20%', size: 15, delay: '-3.4s', duration: '8s' },
  { left: '79%', top: '63%', size: 10, delay: '-1.2s', duration: '6.8s' },
  { left: '93%', top: '32%', size: 15, delay: '-4s', duration: '8.5s' },
  { left: '40%', top: '73%', size: 7, delay: '-5s', duration: '7s' },
  { left: '68%', top: '32%', size: 7, delay: '-2.8s', duration: '6s' },
];

const navItems = [
  { id: 'sobre', label: 'SOBRE' },
  { id: 'projetos', label: 'PROJETOS' },
  { id: 'contato', label: 'CONTATO' },
];

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const brandName = 'Ana Bocheneck';

  return (
    <>
      <SkipLink />
      <header className="reference-navbar" aria-label="Navegação principal">
        <div className="reference-navbar__stars" aria-hidden="true">
          {stars.map((star, index) => (
            <span
              key={index}
              className={`reference-navbar__star reference-navbar__star--${index + 1}`}
              style={{
                left: star.left,
                top: star.top,
                fontSize: `${star.size}px`,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            >✦</span>
          ))}
        </div>

        <div className="reference-navbar__inner">
          <button
            type="button"
            className="reference-navbar__brand"
            onClick={() => onNavigate('home')}
            aria-label={`Ir para o início — ${brandName}`}
          >
            <span className="reference-navbar__brand-mark" aria-hidden="true">✦</span>
            <span>{brandName}</span>
          </button>

          <nav className="reference-navbar__links">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}

            {settings.theme_config?.header?.showAdminButton !== false && (
              <button
                type="button"
                className="reference-navbar__admin"
                onClick={() => onNavigate('admin')}
                aria-current={currentView === 'admin' ? 'page' : undefined}
                aria-label="Área administrativa"
              >
                <span aria-hidden="true">○</span>
                <span className="sr-only">Adim</span>
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
