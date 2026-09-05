import React, { useState } from 'react';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';
import { ThemeIcon } from '../common/ThemeIcon';
import { KineticBrand } from './KineticBrand';
import { InteractiveHeaderBackground } from './InteractiveHeaderBackground';

interface HeaderProps { currentView: string; onNavigate: (view: string, param?: string) => void; }

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  const header = settings.theme_config?.header;
  const h = header;
  const headerStyle = h?.style || 'minimal';
  const navStyle = h?.navStyle || 'underline';

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => { onNavigate(id); setMobileMenuOpen(false); };
  const headerStyleClass = headerStyle === 'boxed' ? 'mx-3 mt-3 rounded-[var(--radius-xl)] border' : headerStyle === 'floating' ? 'mx-3 mt-3 rounded-full border shadow-lg' : headerStyle === 'editorial' ? 'border-b-2' : 'border-b';
  const navClass = (active:boolean) => {
    const base='cursor-pointer transition-all';
    if(navStyle==='pill') return `${base} px-3 py-1.5 rounded-full ${active?'bg-[var(--color-accent)] text-white':'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/50 hover:text-[var(--color-text-primary)]'}`;
    if(navStyle==='simple') return `${base} py-1 ${active?'text-[var(--color-accent)] font-black':'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`;
    return `${base} py-1 ${active?'text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-8 font-black':'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`;
  };

  return <>
    <SkipLink />
    <header
      className={`${h?.sticky === false ? 'relative' : 'sticky top-0'} z-40 w-full overflow-hidden ${headerStyleClass} ${h?.showBorder === false ? 'border-transparent' : 'border-[var(--color-border)]'}`}
      onPointerMove={(e) => {
        const r=e.currentTarget.getBoundingClientRect();
        setPointer({ x: ((e.clientX-r.left)/Math.max(r.width,1)-.5)*2, y: ((e.clientY-r.top)/Math.max(r.height,1)-.5)*2, active:true });
      }}
      onPointerLeave={()=>setPointer({x:0,y:0,active:false})}
      style={{ minHeight:`${h?.heightPx||80}px`, backgroundColor:`color-mix(in srgb, var(--color-surface) ${Math.round((h?.opacity ?? .62)*100)}%, transparent)`, backdropFilter:h?.blur===false?'none':'blur(8px)', isolation:'isolate' }}
    >
      <InteractiveHeaderBackground header={h || ({} as any)} pointer={pointer} />
      <div className="relative z-10 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] flex items-center justify-between" style={{minHeight:`${h?.heightPx||80}px`}}>
        <button onClick={()=>handleNavClick('projetos')} className="portfolio-brand cursor-pointer focus:outline-none relative z-10" aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}>
          {h?.showBrandIcon !== false && <span className="shrink-0 flex items-center justify-center text-[var(--color-accent)]" style={{width:h?.iconSizePx||28,height:h?.iconSizePx||28}}><ThemeIcon icon={settings.theme_config?.brandIcon} className="w-full h-full" /></span>}
          <KineticBrand text={settings.portfolio_name || 'STUDIO.X'} header={{...(h || ({} as any)), animation:'wrapped3d', backgroundEnabled:true}} />
        </button>

        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navItems.map(item=><button key={item.id} onClick={()=>handleNavClick(item.id)} aria-current={currentView===item.id?'page':undefined} className={navClass(currentView===item.id)} style={{fontSize:`${h?.navFontSizePx||11}px`,fontWeight:h?.navWeight||700,letterSpacing:`${h?.navLetterSpacing||.35}em`,textTransform:h?.navUppercase===false?'none':'uppercase'}}>{item.label}</button>)}
          {h?.showAdminButton !== false && <button onClick={()=>handleNavClick('admin')} className="ml-1 p-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" aria-label="Área administrativa"><Shield className="w-4 h-4" /></button>}
        </nav>
        <button type="button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-[var(--radius-md)] text-[var(--color-text-primary)] border border-[var(--color-border)] relative z-10" aria-expanded={mobileMenuOpen}>{mobileMenuOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
      </div>
      {mobileMenuOpen && <div id="mobile-menu" className="relative z-10 md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--layout-padding)] py-4 space-y-2"><nav className="flex flex-col space-y-1">{navItems.map(item=><button key={item.id} onClick={()=>handleNavClick(item.id)} className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] ${currentView===item.id?'bg-[var(--color-primary)] text-white':'text-[var(--color-text-primary)] hover:bg-black/5'}`}>{item.label}</button>)}{h?.showAdminButton !== false && <button onClick={()=>handleNavClick('admin')} className="w-full text-left px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-between"><span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--color-accent)]"/>Área Administrativa</span><Sparkles className="w-4 h-4 text-[var(--color-accent)]"/></button>}</nav></div>}
    </header>
  </>;
};
