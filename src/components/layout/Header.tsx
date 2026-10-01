import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

const stars = [
  { left: '7%', top: '31%', size: 25, delay: '-1.2s', duration: '8.5s' },
  { left: '16%', top: '78%', size: 12, delay: '-2.8s', duration: '9.2s' },
  { left: '28%', top: '20%', size: 11, delay: '-4.1s', duration: '8.8s' },
  { left: '38%', top: '67%', size: 10, delay: '-1.7s', duration: '9.6s' },
  { left: '48%', top: '30%', size: 13, delay: '-3.4s', duration: '8.9s' },
  { left: '58%', top: '17%', size: 9, delay: '-5.2s', duration: '9.4s' },
  { left: '68%', top: '74%', size: 12, delay: '-2.2s', duration: '8.7s' },
  { left: '78%', top: '26%', size: 10, delay: '-4.8s', duration: '9.8s' },
  { left: '88%', top: '62%', size: 14, delay: '-1.4s', duration: '9.1s' },
  { left: '94%', top: '22%', size: 24, delay: '-3.9s', duration: '8.6s' },
  { left: '22%', top: '47%', size: 8, delay: '-5.8s', duration: '10s' },
  { left: '73%', top: '48%', size: 7, delay: '-2.9s', duration: '9.5s' },
];

const navItems = [
  { id: 'sobre', label: 'SOBRE' },
  { id: 'projetos', label: 'PROJETOS' },
  { id: 'contato', label: 'CONTATO' },
];

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const brandName = 'Ana Bocheneck';

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    event.currentTarget.style.setProperty('--pointer-x', x.toFixed(3));
    event.currentTarget.style.setProperty('--pointer-y', y.toFixed(3));

    event.currentTarget.querySelectorAll<HTMLElement>('.reference-navbar__star').forEach((star, index) => {
      const depth = 0.55 + (index % 4) * 0.10;
      star.style.setProperty('--hover-x', `${(x * 6.0 * depth).toFixed(2)}px`);
      star.style.setProperty('--hover-y', `${(y * 4.6 * depth).toFixed(2)}px`);
    });
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--pointer-x', '0');
    event.currentTarget.style.setProperty('--pointer-y', '0');
    event.currentTarget.querySelectorAll<HTMLElement>('.reference-navbar__star').forEach((star) => {
      star.style.setProperty('--hover-x', '0px');
      star.style.setProperty('--hover-y', '0px');
    });
  };

  return (
    <>
      <SkipLink />
      <header
        className="reference-navbar"
        aria-label="Navegação principal"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="reference-navbar__stars" aria-hidden="true">
          {stars.map((star, index) => (
            <span
              key={index}
              className={`reference-navbar__star reference-navbar__star--${index + 1}`}
              style={{
                left: star.left,
                top: star.top,
                ['--star-size' as string]: `${star.size}px`,
                ['--star-delay' as string]: star.delay,
                ['--star-duration' as string]: star.duration,
              }}
            >
              <span className="reference-navbar__star-glyph">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M16 0 L17.4 13.6 L28.5 3.5 L18.4 14.6 L32 16 L18.4 17.4 L28.5 28.5 L17.4 18.4 L16 32 L14.6 18.4 L3.5 28.5 L13.6 17.4 L0 16 L13.6 14.6 L3.5 3.5 L14.6 13.6 Z" />
                </svg>
              </span>
            </span>
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
                <span className="reference-navbar__admin-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3.5L19 6.2V11.4C19 16.1 16.2 19.2 12 20.5C7.8 19.2 5 16.1 5 11.4V6.2L12 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </span>
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
