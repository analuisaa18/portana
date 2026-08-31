import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { SkipLink } from '../common/SkipLink';
import { ThemeIcon } from '../common/ThemeIcon';
import { DEFAULT_THEME_CONFIG } from '../../services/defaultData';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandHovered, setBrandHovered] = useState(false);
  const [brandPointer, setBrandPointer] = useState({ x: 0, y: 0 });
  const header = { ...DEFAULT_THEME_CONFIG.header, ...(settings.theme_config?.header || {}) };
  const headerStyle = header.style || 'minimal';
  const headerAnimation = header.animation || 'wave';
  const intensity = Math.max(0, Math.min(2, header.animationIntensity ?? 1));
  const navStyle = header.navStyle || 'plain';
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <SkipLink />
      <header
        className={`z-40 w-full transition-all ${header.sticky ? 'sticky top-0' : 'relative'} ${headerStyle === 'floating' ? 'pt-3 px-[var(--layout-padding)]' : ''}`}
        style={{
          borderBottom: header.showBorder ? '1px solid var(--color-border)' : 'none',
          backgroundColor: `color-mix(in srgb, var(--color-surface) ${Math.round((header.backgroundOpacity ?? 0.9) * 100)}%, transparent)`,
          backdropFilter: header.blur ? 'blur(var(--header-blur))' : 'none',
        }}
      >
        <div
          className={`max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] flex items-center justify-between w-full transition-all ${headerStyle === 'boxed' ? 'rounded-[var(--radius-lg)] border border-[var(--color-border)] my-2' : ''} ${headerStyle === 'floating' ? 'rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-sm my-2' : ''}`}
          style={{
            minHeight: 'var(--header-height)',
            paddingTop: headerStyle === 'editorial' ? '0.5rem' : undefined,
            paddingBottom: headerStyle === 'editorial' ? '0.5rem' : undefined,
          }}
        >
          {/* Brand Logo / Portfolio Name */}
          <button
            onClick={() => handleNavClick('projetos')}
            className={`portfolio-brand cursor-pointer focus:outline-none ${headerStyle === 'editorial' ? 'portfolio-brand--editorial' : ''} ${brandHovered ? 'portfolio-brand--active' : ''}`}
            aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}
            onPointerEnter={() => setBrandHovered(true)}
            onPointerLeave={() => {
              setBrandHovered(false);
              setBrandPointer({ x: 0, y: 0 });
            }}
          >
            <ThemeIcon icon={settings.theme_config?.brandIcon} className="shrink-0 text-[var(--color-accent)]" style={{ width: 'var(--header-icon-size)', height: 'var(--header-icon-size)', display: header.showBrandIcon ? undefined : 'none' }} />
            <span
              className={`portfolio-brand-name text-[var(--color-text-primary)] ${headerAnimation === 'none' ? '' : `portfolio-brand-animation--${headerAnimation}`}`}
              style={{
                fontSize: 'var(--header-name-size)',
                fontWeight: 'var(--header-name-weight)' as React.CSSProperties['fontWeight'],
                letterSpacing: 'var(--header-name-spacing)',
              }}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
                const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
                setBrandPointer({ x: x * 5, y: y * 5 });
              }}
            >
              {(settings.portfolio_name || 'STUDIO.X').split('').map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  className="portfolio-brand-letter"
                  style={{
                    '--letter-index': index,
                    transform: !isReducedMotion && brandHovered && headerAnimation !== 'none'
                      ? headerAnimation === 'magnetic'
                        ? `translate3d(${brandPointer.x * 0.75 * intensity}px, ${brandPointer.y * 0.5 * intensity}px, 0) rotate(${brandPointer.x * 0.18 * intensity}deg) scale(${1 + 0.05 * intensity})`
                        : headerAnimation === 'lift'
                          ? `translate3d(${brandPointer.x * 0.16 * intensity}px, ${-5 * intensity}px, 0) rotate(${index % 2 ? 2 : -2}deg) scale(${1 + 0.025 * intensity})`
                          : `translate3d(${brandPointer.x * (0.18 + (index % 4) * 0.035) * intensity}px, ${(-5 - (index % 3) * 3) * intensity + brandPointer.y * 0.22 * intensity}px, 0) rotate(${(index % 2 ? 3 : -3) + brandPointer.x * 0.08}deg) scale(${index % 3 === 0 ? 1.08 : 1.035})`
                      : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
                    color: brandHovered ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    transitionDelay: `${index * 18}ms`,
                  } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {character === ' ' ? '\u00A0' : character}
                </span>
              ))}
            </span>
            {settings.tagline && (
              <span className="font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)] hidden sm:block" style={{ fontSize: 'var(--header-tagline-size)', display: header.showTagline ? undefined : 'none' }}>
                {settings.tagline}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${navStyle === 'pill' ? 'gap-2' : ''} ${headerStyle === 'editorial' ? 'border-l border-[var(--color-border)] pl-5' : ''}`} style={{ gap: header.navStyle === 'pill' ? undefined : 'var(--header-nav-gap)' }} aria-label="Navegação Principal">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`transition-all cursor-pointer ${
                    navStyle === 'pill'
                      ? 'px-3 py-1.5 rounded-full border'
                      : navStyle === 'underline'
                        ? 'py-1 underline-offset-8'
                        : 'py-1'
                  } ${
                    isActive
                      ? navStyle === 'pill'
                        ? 'text-[var(--color-bg)] bg-[var(--color-accent)] border-[var(--color-accent)]'
                        : navStyle === 'underline'
                          ? 'text-[var(--color-accent)] underline decoration-[var(--color-accent)]'
                          : 'text-[var(--color-accent)]'
                      : navStyle === 'pill'
                        ? 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                  style={{
                    fontSize: 'var(--header-nav-size)',
                    fontWeight: 'var(--header-nav-weight)' as React.CSSProperties['fontWeight'],
                    textTransform: header.navUppercase ? 'uppercase' : 'none',
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Admin shortcut */}
            {header.showAdminButton !== false && <button
              onClick={() => handleNavClick('admin')}
              className={`ml-2 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[var(--radius-sm)] border flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView.startsWith('admin')
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary)]'
              }`}
              title="Acessar Área Administrativa"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-[var(--radius-md)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-black/5 cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--layout-padding)] py-4 space-y-2 animate-fade-in"
          >
            <nav className="flex flex-col space-y-1" aria-label="Navegação Mobile">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white font-semibold'
                        : 'text-[var(--color-text-primary)] hover:bg-black/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {header.showAdminButton !== false && <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-4 py-3 text-sm font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-between mt-2 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>Área Administrativa</span>
                </span>
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              </button>}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
