import React, { useEffect, useState } from 'react';
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
  const [brandHovered, setBrandHovered] = useState(false);
  const [brandPointer, setBrandPointer] = useState({ x: 0, y: 0 });
  const [brandTick, setBrandTick] = useState(0);

  const header = settings.theme_config?.header;
  const headerStyle = header?.style || 'minimal';
  const animation = header?.animation || 'wave';
  const intensity = header?.animationIntensity ?? 1;
  const navStyle = header?.navStyle || 'underline';

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];

  useEffect(() => {
    if (!brandHovered || animation !== 'wrapped3d') return;

    let frame = 0;
    let raf = 0;

    const tick = () => {
      frame += 1;
      setBrandTick(frame);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [brandHovered, animation]);

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

  const getLetterTransform = (index: number) => {
    if (!brandHovered || animation === 'none') {
      return 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
    }

    const x = brandPointer.x * intensity;
    const y = brandPointer.y * intensity;

    if (animation === 'lift') {
      return `translate3d(${x * 0.12}px, ${-3 * intensity + y * 0.04}px, 0) rotate(${x * 0.12}deg) scale(${1 + 0.025 * intensity})`;
    }

    if (animation === 'magnetic') {
      const factor = 0.55 + (index % 3) * 0.06;
      return `translate3d(${x * factor}px, ${y * factor}px, 0) rotate(${x * 0.08}deg) scale(${1 + Math.min(0.12, Math.abs(x) * 0.006 * intensity)})`;
    }

    if (animation === 'wrapped3d') {
      const depth = header?.animationDepth ?? 70;
      const mouseStrength = header?.animationMouseStrength ?? 1;
      const speed = header?.animationSpeed ?? 1;
      const t = brandTick * 0.016 * speed;
      const phase = index * 0.72;
      const wave = Math.sin(t * 2 + phase) * 7 * intensity;
      const waveX = Math.cos(t * 1.4 + phase) * 3 * intensity;
      const z = Math.sin(phase + x * 0.025) * depth * 0.55 + x * 3.5 * mouseStrength;
      const rotateY = Math.sin(phase + x * 0.04) * 13 * intensity + x * 1.7 * mouseStrength;
      const rotateX = y * -3.5 * mouseStrength + Math.cos(phase + t) * 3;
      const rotateZ = Math.sin(phase + t * 1.2) * 2.2 + x * 0.25;
      const lift = wave - Math.abs(x) * 0.8 + y * 1.8 * mouseStrength;
      const scale = 1 + Math.sin(phase + t) * 0.035;
      return `translate3d(${waveX}px, ${lift}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    }

    const wave = Math.sin(index * 0.9 + x * 0.08) * 2.5 * intensity;
    const vertical = -5 * intensity - (index % 3) * 2 * intensity + y * 0.12 + wave;
    const horizontal = x * (0.16 + (index % 3) * 0.025);
    const rotation = (index % 2 ? 2.5 : -2.5) * intensity + x * 0.06;
    const scale = 1 + (index % 3 === 0 ? 0.06 : 0.025) * intensity;

    return `translate3d(${horizontal}px, ${vertical}px, 0) rotate(${rotation}deg) scale(${scale})`;
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
            className={`portfolio-brand cursor-pointer focus:outline-none ${brandHovered ? 'portfolio-brand--active' : ''}`}
            aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}
            onPointerEnter={() => setBrandHovered(true)}
            onPointerLeave={() => {
              setBrandHovered(false);
              setBrandPointer({ x: 0, y: 0 });
            }}
          >
            {header?.showBrandIcon !== false && (
              <span
                className="shrink-0 flex items-center justify-center text-[var(--color-accent)]"
                style={{ width: header?.iconSizePx || 28, height: header?.iconSizePx || 28 }}
              >
                <ThemeIcon
                  icon={settings.theme_config?.brandIcon}
                  className="w-full h-full"
                />
              </span>
            )}
            <span
              className="portfolio-brand-name text-[var(--color-text-primary)]"
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
                const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
                setBrandPointer({ x: x * 12, y: y * 10 });
              }}
              style={{
                fontSize: `${header?.brandFontSizePx || 24}px`,
                fontWeight: header?.brandWeight || 900,
                letterSpacing: `${header?.brandLetterSpacing ?? -0.04}em`,
                textTransform: 'uppercase',
                perspective: `${header?.animationPerspective ?? 900}px`,
                transformStyle: 'preserve-3d',
              }}
            >
              {(settings.portfolio_name || 'STUDIO.X').split('').map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  className={`portfolio-brand-letter inline-block ${animation === 'wrapped3d' ? 'portfolio-brand-letter--wrapped3d' : ''}`}
                  data-letter={character}
                  style={{
                    transform: getLetterTransform(index),
                    color: brandHovered && animation !== 'none' ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms ease',
                    transitionDelay: `${index * 12}ms`,
                    transformOrigin: 'center bottom',
                  }}
                  aria-hidden="true"
                >
                  {character === ' ' ? '\u00A0' : character}
                </span>
              ))}
            </span>
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
