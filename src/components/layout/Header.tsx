import React, { useEffect, useState } from 'react';
import { Menu, X, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SkipLink } from '../common/SkipLink';
import { ThemeIcon } from '../common/ThemeIcon';
import { HeaderCircleField } from './HeaderCircleField';

interface HeaderProps { currentView: string; onNavigate: (view: string, param?: string) => void; }

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1280 : window.innerWidth);
  const header = settings.theme_config?.header;
  const h = header;
  const breakpoint = h?.responsiveBreakpointPx ?? 768;
  const responsive = h?.responsiveEnabled !== false;
  // O layout móvel precisa continuar funcional mesmo quando a personalização
  // responsiva está desligada; nesse caso usamos os valores padrão do mobile.
  const isMobile = viewportWidth < breakpoint;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.visualViewport?.width || window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    window.visualViewport?.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);
  const headerStyle = h?.style || 'minimal';
  const navStyle = h?.navStyle || 'underline';

  const navItems = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => { onNavigate(id); setMobileMenuOpen(false); };
  const headerStyleClass = headerStyle === 'boxed' ? 'mx-3 mt-3 rounded-[var(--radius-xl)] border' : headerStyle === 'floating' ? 'mx-3 mt-3 rounded-full border shadow-lg' : headerStyle === 'editorial' ? 'border-b-2' : 'border-b';
  const useCustomMobile = isMobile && responsive;
  const effectiveHeight = isMobile ? (useCustomMobile ? (h?.mobileHeightPx ?? 104) : 88) : (h?.heightPx ?? 80);
  const effectivePadding = isMobile ? (useCustomMobile ? (h?.mobileContainerPaddingPx ?? 16) : 16) : (h?.desktopContainerPaddingPx ?? 32);
  const effectiveBrandSize = isMobile ? (useCustomMobile ? (h?.mobileBrandFontSizePx ?? 18) : 18) : (h?.brandFontSizePx ?? 24);
  const effectiveBrandWeight = isMobile ? (useCustomMobile ? (h?.mobileBrandWeight ?? h?.brandWeight ?? 900) : (h?.brandWeight ?? 900)) : (h?.brandWeight ?? 900);
  const effectiveBrandSpacing = isMobile ? (useCustomMobile ? (h?.mobileBrandLetterSpacing ?? h?.brandLetterSpacing ?? -0.04) : (h?.brandLetterSpacing ?? -0.04)) : (h?.brandLetterSpacing ?? -0.04);
  const effectiveIconSize = isMobile ? (useCustomMobile ? (h?.mobileIconSizePx ?? 22) : 20) : (h?.iconSizePx ?? 28);
  const effectiveNavSize = isMobile ? (useCustomMobile ? (h?.mobileNavFontSizePx ?? 10) : 10) : (h?.navFontSizePx ?? 11);
  const effectiveNavGap = isMobile ? (useCustomMobile ? (h?.mobileNavGapPx ?? 12) : 10) : (h?.desktopNavGapPx ?? 24);
  const effectiveBrandMaxWidth = isMobile ? (useCustomMobile ? (h?.mobileBrandMaxWidthPx ?? 260) : 240) : (h?.desktopBrandMaxWidthPx ?? 560);
  const effectiveBackgroundEnabled = isMobile ? (useCustomMobile ? h?.mobileBackgroundEnabled !== false : true) : true;

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
      style={{ minHeight:`${Math.max(effectiveHeight, 72)}px`, backgroundColor:`color-mix(in srgb, var(--color-surface) ${Math.round((h?.opacity ?? .62)*100)}%, transparent)`, backdropFilter:h?.blur===false?'none':'blur(8px)', isolation:'isolate' }}
    >
      {effectiveBackgroundEnabled && <HeaderCircleField
        header={{...(h || ({} as any)), circleFieldOpacity: isMobile ? ((h?.circleFieldOpacity ?? 1) * (h?.mobileBackgroundOpacity ?? 0.85)) : h?.circleFieldOpacity}}
        pointer={pointer}
      />}
      <div className="relative z-10 max-w-[var(--layout-max-width)] mx-auto flex items-center justify-center w-full" style={{minHeight:`${Math.max(effectiveHeight, 72)}px`, paddingLeft:`${effectivePadding}px`, paddingRight:`${effectivePadding}px`}}>
        <div className="header-desktop-cluster flex items-center justify-center min-w-0" style={{gap:`${Math.max(effectiveNavGap * 1.5, 28)}px`}}>
          <button onClick={()=>handleNavClick('projetos')} className="portfolio-brand cursor-pointer focus:outline-none relative z-10 shrink-0 min-w-0" style={{maxWidth:`${effectiveBrandMaxWidth}px`, fontSize:`${effectiveNavSize}px`, fontWeight:h?.navWeight||700, letterSpacing:`${h?.navLetterSpacing||.35}em`, fontFamily:'var(--font-body)', color:'#fff'}} aria-label={`Ir para projetos — ${settings.portfolio_name || 'STUDIO.X'}`}>
            {(!isMobile || h?.mobileShowBrandIcon !== false) && h?.showBrandIcon !== false && <span className="shrink-0 flex items-center justify-center text-[var(--color-accent)]" style={{width:effectiveIconSize,height:effectiveIconSize}}><ThemeIcon icon={settings.theme_config?.brandIcon} className="w-full h-full" /></span>}
            <span className="header-wrapped-brand header-brand-inline" aria-label={settings.portfolio_name || 'STUDIO.X'} style={{width:'auto', maxWidth:'100%', height:'auto', minWidth:0, overflow:'visible'}}>
              <span
                className="portfolio-brand-name-fallback header-brand-static"
                style={{
                  display: 'block',
                  width: 'auto',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  letterSpacing: 'inherit',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {settings.portfolio_name || 'STUDIO.X'}
              </span>
              <span className="sr-only">{settings.portfolio_name || 'STUDIO.X'}</span>
            </span>
          </button>

          <nav className="desktop-centered-nav relative z-30 shrink-0 items-center" style={{position:'static', transform:'none', display:isMobile ? 'none' : 'flex', gap:`${effectiveNavGap}px`, maxWidth:'none'}} aria-label="Navegação principal">
            {navItems.map(item=><button key={item.id} onClick={()=>handleNavClick(item.id)} aria-current={currentView===item.id?'page':undefined} className={navClass(currentView===item.id)} style={{fontSize:`${effectiveNavSize}px`,fontWeight:h?.navWeight||700,letterSpacing:`${h?.navLetterSpacing||.35}em`,textTransform:h?.navUppercase===false?'none':'uppercase'}}>{item.label}</button>)}
            {h?.showAdminButton !== false && <button onClick={()=>handleNavClick('admin')} className="ml-1 p-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" aria-label="Área administrativa"><Shield className="w-4 h-4" /></button>}
          </nav>
        </div>
        <button type="button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-[var(--radius-md)] text-[var(--color-text-primary)] border border-[var(--color-border)] relative z-10" style={{display:isMobile ? 'block' : 'none'}} aria-expanded={mobileMenuOpen}>{mobileMenuOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button>
      </div>
      {mobileMenuOpen && <div id="mobile-menu" className="relative z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)] py-4 space-y-2" style={{paddingLeft:`${effectivePadding}px`,paddingRight:`${effectivePadding}px`}}><nav className="flex flex-col space-y-1">{navItems.map(item=><button key={item.id} onClick={()=>handleNavClick(item.id)} className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] ${currentView===item.id?'bg-[var(--color-primary)] text-white':'text-[var(--color-text-primary)] hover:bg-black/5'}`}>{item.label}</button>)}{h?.showAdminButton !== false && <button onClick={()=>handleNavClick('admin')} className="w-full text-left px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center justify-between"><span className="flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--color-accent)]"/>Área Administrativa</span><Sparkles className="w-4 h-4 text-[var(--color-accent)]"/></button>}</nav></div>}
    </header>
  </>;
};
