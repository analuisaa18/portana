import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

const stars = [
  { left: '6%', top: '28%', size: 24, delay: '0s', duration: '7s', color: 'white' },
  { left: '13%', top: '68%', size: 13, delay: '-1.2s', duration: '6.2s', color: 'pink' },
  { left: '22%', top: '18%', size: 10, delay: '-2s', duration: '8s', color: 'white' },
  { left: '31%', top: '72%', size: 15, delay: '-3s', duration: '7.4s', color: 'pink' },
  { left: '39%', top: '28%', size: 12, delay: '-4s', duration: '6.7s', color: 'white' },
  { left: '47%', top: '67%', size: 21, delay: '-1.8s', duration: '8.4s', color: 'pink' },
  { left: '56%', top: '17%', size: 11, delay: '-5s', duration: '7.1s', color: 'white' },
  { left: '64%', top: '74%', size: 14, delay: '-2.6s', duration: '6.5s', color: 'pink' },
  { left: '72%', top: '31%', size: 19, delay: '-4.5s', duration: '8.2s', color: 'white' },
  { left: '81%', top: '69%', size: 11, delay: '-1s', duration: '7.6s', color: 'pink' },
  { left: '90%', top: '22%', size: 23, delay: '-3.6s', duration: '6.9s', color: 'white' },
  { left: '95%', top: '70%', size: 10, delay: '-5.4s', duration: '8.1s', color: 'pink' },
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
      const depth = 0.7 + (index % 4) * 0.25;
      star.style.setProperty('--hover-x', `${(x * 22 * depth).toFixed(1)}px`);
      star.style.setProperty('--hover-y', `${(y * 14 * depth).toFixed(1)}px`);
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
      <header className="reference-navbar" aria-label="Navegação principal" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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
                  ['--star-depth' as string]: `${0.65 + (index % 4) * 0.18}`,
              }}
            >✷</span>
          ))}
        </div>

        <div className="reference-navbar__inner">
          <button
            type="button"
            className="reference-navbar__brand"
            onClick={() => onNavigate('home')}
            aria-label={`Ir para o início — ${brandName}`}
          >
            <span className="reference-navbar__brand-mark" aria-hidden="true">✷</span>
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
