import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { KineticBrand } from './KineticBrand';
import { SkipLink } from '../common/SkipLink';
import { ThemeIcon } from '../common/ThemeIcon';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const header = settings.theme_config?.header;
  const headerStyle = header?.style || 'minimal';
  const navStyle = header?.navStyle || 'underline';

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];


  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  const headerStyleClass =
    headerStyle === 'boxed'
      ? 'mx-3 mt-3 rounded-[var(--radius-xl)] border'
      : headerStyle === 'floating'
        ? 'mx-3 mt-3 rounded-full border shadow-lg'
        : headerStyle === 'editorial'
          ? 'border-b-2'
          : 'border-b';

  const navClass = (isActive: boolean) => {
    const base = 'cursor-pointer transition-all';
    if (navStyle === 'pill') {
      return `${base} px-3 py-1.5 rounded-full text-[var(--color-text-secondary)] ${isActive ? 'bg-[var(--color-accent)] text-white' : 'hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]'}`;
    }
    if (navStyle === 'simple') {
      return `${base} py-1 ${isActive ? 'text-[var(--color-accent)] font-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`;
    }
    return `${base} py-1 ${isActive ? 'text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-8 font-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`;
  };


  return (
    <>
      <SkipLink />
      <header
        className={`${header?.sticky === false ? 'relative' : 'sticky top-0'} z-40 w-full ${headerStyleClass} ${header?.showBorder === false ? 'border-transparent' : 'border-[var(--color-border)]'} bg-[var(--color-surface)] transition-all`}
        style={{
          minHeight: `${header?.heightPx || 80}px`,
          backgroundColor: `color-mix(in srgb, var(--color-surface) ${Math.round((header?.opacity ?? 0.9) * 100)}%, transparent)`,
          backdropFilter: header?.blur === false ? 'none' : 'blur(12px)',
        }}
      >
        <div
          className="max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] flex items-center justify-between"
          style={{ minHeight: `${header?.heightPx || 80}px` }}
        >
          <button
            onClick={() => handleNavClick('projetos')}
            className="portfolio-brand cursor-pointer focus:outline-none"
            aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}
          >
            {header?.showBrandIcon !== false && (
              <span
                className="shrink-0 flex items-center justify-center text-[var(--color-accent)]"
                style={{ width: header?.iconSizePx || 28, height: header?.iconSizePx || 28 }}
              >
                <ThemeIcon icon={settings.theme_config?.brandIcon} className="w-full h-full" />
              </span>
            )}
            <KineticBrand
              text={settings.portfolio_name || 'STUDIO.X'}
              header={header || {
                style: 'minimal', sticky: true, showBorder: true, blur: true, opacity: 0.9,
                heightPx: 80, showBrandIcon: true, iconSizePx: 28, brandFontSizePx: 24,
                brandWeight: 900, brandLetterSpacing: -0.04, showTagline: true,
                navStyle: 'underline', navFontSizePx: 11, navWeight: 700, navLetterSpacing: 0.35,
                navUppercase: true, showAdminButton: true, animation: 'wrapped3d',
                animationIntensity: 1, animationPerspective: 900, animationDepth: 110,
                animationSpeed: 1, animationMouseStrength: 1.4, animationRepeat: 3,
              }}
              className="portfolio-brand-name"
            />
            {header?.showTagline !== false && settings.tagline && (
              <span className="text-[10px] font-bold tracking-[0.3em] text-[var(--color-text-secondary)] hidden sm:block">
                {settings.tagline}
              </span>
            )}
          </button>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação Principal">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={navClass(isActive)}
                  style={{
                    fontSize: `${header?.navFontSizePx || 11}px`,
                    fontWeight: header?.navWeight || 700,
                    letterSpacing: `${header?.navLetterSpacing ?? 0.35}em`,
                    textTransform: header?.navUppercase === false ? 'none' : 'uppercase',
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {header?.showAdminButton !== false && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`ml-2 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[var(--radius-sm)] border flex items-center gap-1.5 transition-colors cursor-pointer ${currentView.startsWith('admin') ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary)]'}`}
                title="Acessar Área Administrativa"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

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

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--layout-padding)] py-4 space-y-2 animate-fade-in">
            <nav className="flex flex-col space-y-1" aria-label="Navegação Mobile">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-4 py-3 text-base font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer ${isActive ? 'bg-[var(--color-primary)] text-white font-semibold' : 'text-[var(--color-text-primary)] hover:bg-black/5'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
              {header?.showAdminButton !== false && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full text-left px-4 py-3 text-sm font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-between mt-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--color-accent)]" /><span>Área Administrativa</span></span>
                  <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
