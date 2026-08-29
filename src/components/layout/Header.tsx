import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { SkipLink } from '../common/SkipLink';
import { ThemeIcon } from '../common/ThemeIcon';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md transition-colors">
        <div className="max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] h-20 flex items-center justify-between">
          {/* Brand Logo / Portfolio Name */}
          <button
            onClick={() => handleNavClick('projetos')}
            className="portfolio-brand group cursor-pointer focus:outline-none"
            aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}
          >
            <ThemeIcon icon={settings.theme_config?.brandIcon} className="w-7 h-7 shrink-0 text-[var(--color-accent)]" />
            <span
              className="portfolio-brand-name text-xl md:text-2xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]"
              onMouseMove={(event) => {
                const target = event.currentTarget;
                const rect = target.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                target.style.setProperty('--brand-mx', `${x * 3}px`);
                target.style.setProperty('--brand-my', `${y * 3}px`);
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.setProperty('--brand-mx', '0px');
                event.currentTarget.style.setProperty('--brand-my', '0px');
              }}
            >
              {(settings.portfolio_name || 'STUDIO.X').split('').map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  className="portfolio-brand-letter"
                  style={{ '--letter-index': index } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {character === ' ' ? '\u00A0' : character}
                </span>
              ))}
            </span>
            {settings.tagline && (
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)] hidden sm:block">
                {settings.tagline}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação Principal">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-[11px] font-bold uppercase tracking-[0.35em] transition-all cursor-pointer py-1 ${
                    isActive
                      ? 'text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-8 font-black'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Admin shortcut */}
            <button
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
            </button>
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

              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-4 py-3 text-sm font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-between mt-2 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>Área Administrativa</span>
                </span>
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
