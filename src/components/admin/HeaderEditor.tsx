import React, { useEffect, useState } from 'react';
import { PanelTop, Save, RotateCcw, Eye, Sparkles, MousePointer2, Play, Type } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_THEME_CONFIG } from '../../services/defaultData';
import { HeaderAnimation, HeaderAnimationColorMode, ThemeHeader } from '../../types/portfolio';
import { KineticBrand } from '../layout/KineticBrand';

interface HeaderEditorProps {
  onSaved?: () => void;
}

const KINETIC_PRESETS: Array<{ value: HeaderAnimation; label: string; description: string }> = [
  { value: 'none', label: 'Estática', description: 'Sem movimento' },
  { value: 'lift', label: 'Lift', description: 'Elevação ao apontar' },
  { value: 'wave', label: 'Wave', description: 'Onda contínua por letra' },
  { value: 'magnetic', label: 'Magnetic', description: 'Letras atraídas pelo cursor' },
  { value: 'elastic', label: 'Elastic', description: 'Compressão e expansão tipográfica' },
  { value: 'ripple', label: 'Ripple', description: 'Onda circular com profundidade' },
  { value: 'orbit', label: '3D Orbit', description: 'Rotação espacial por caractere' },
  { value: 'glitch', label: 'Glitch', description: 'Deslocamento digital fragmentado' },
  { value: 'stretch', label: 'Stretch', description: 'Alongamento cinético variável' },
];

const FONT_SUGGESTIONS = [
  'Space Grotesk', 'Syne', 'Archivo Black', 'Bebas Neue', 'Bungee', 'Chivo Mono',
  'DM Sans', 'Figtree', 'Fraunces', 'IBM Plex Mono', 'IBM Plex Sans', 'Instrument Sans',
  'Manrope', 'Montserrat', 'Noto Sans', 'Oswald', 'Outfit', 'Playfair Display',
  'Roboto Flex', 'Rubik', 'Sora', 'Space Mono', 'Unbounded', 'Urbanist', 'Work Sans',
];

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ onSaved }) => {
  const { themeConfig, updateThemeConfig, settings, reducedMotion } = useTheme();
  const [header, setHeader] = useState<ThemeHeader>({
    ...DEFAULT_THEME_CONFIG.header,
    ...(themeConfig?.header || {}),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const family = header.brandFontFamily?.trim();
    if (!family) return;
    const cleanFamily = family.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    if (!cleanFamily) return;
    const id = `header-preview-font-${cleanFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily).replace(/%20/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }, [header.brandFontFamily]);

  const update = (patch: Partial<ThemeHeader>) => {
    setSaved(false);
    setHeader(prev => ({ ...prev, ...patch }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateThemeConfig({
        ...themeConfig,
        header,
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setHeader({ ...DEFAULT_THEME_CONFIG.header });
    setSaved(false);
  };

  const controlClass = 'w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] text-sm';
  const cardClass = 'p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]';
  const sliderClass = 'w-full accent-[var(--color-accent)]';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <PanelTop className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Personalização</span>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] mt-1">Header & Tipografia Cinética</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-3xl">
            Configure a estrutura do cabeçalho e transforme o nome do portfólio em tipografia interativa. Os efeitos são executados em JavaScript no próprio site e persistidos no tema.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="px-4 py-2.5 text-xs font-bold border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Restaurar
          </button>
          <button type="button" onClick={save} disabled={saving} className="px-4 py-2.5 text-xs font-bold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-bg)] flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar Header'}
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-[var(--color-accent)]" /> Estrutura</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ['minimal', 'Minimal'],
            ['boxed', 'Caixa'],
            ['editorial', 'Editorial'],
            ['floating', 'Flutuante'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => update({ style: value as ThemeHeader['style'] })}
              className={`p-3 rounded-[var(--radius-md)] border text-left ${header.style === value ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}>
              <span className="font-bold block">{label}</span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">Estilo</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {[
            ['sticky', 'Header fixo'],
            ['showBorder', 'Mostrar borda'],
            ['blur', 'Blur'],
            ['showAdminButton', 'Botão Admin'],
            ['showBrandIcon', 'Ícone da marca'],
            ['showTagline', 'Tagline'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 p-3 border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm cursor-pointer">
              <input type="checkbox" checked={Boolean(header[key as keyof ThemeHeader])}
                onChange={e => update({ [key]: e.target.checked } as Partial<ThemeHeader>)} />
              {label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <label className="text-xs font-semibold space-y-1 block">Altura (px)
            <input className={controlClass} type="number" min="48" max="180" value={header.heightPx} onChange={e => update({ heightPx: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Opacidade
            <input className={controlClass} type="number" min="0.35" max="1" step="0.05" value={header.opacity} onChange={e => update({ opacity: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Ícone (px)
            <input className={controlClass} type="number" min="12" max="80" value={header.iconSizePx} onChange={e => update({ iconSizePx: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><Type className="w-4 h-4 text-[var(--color-primary)]" /> Marca & Fonte</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="text-xs font-semibold space-y-1 block md:col-span-2">Fonte exclusiva do nome
            <input
              list="header-font-suggestions"
              className={controlClass}
              value={header.brandFontFamily || ''}
              onChange={e => update({ brandFontFamily: e.target.value })}
              placeholder="Vazio = usar a fonte global dos títulos"
            />
            <datalist id="header-font-suggestions">
              {FONT_SUGGESTIONS.map(font => <option key={font} value={font} />)}
            </datalist>
            <span className="block text-[10px] font-normal text-[var(--color-text-secondary)]">Aceita nomes de Google Fonts, por exemplo: Unbounded, Syne, Roboto Flex.</span>
          </label>
          <label className="text-xs font-semibold space-y-1 block">Tamanho do nome (px)
            <input className={controlClass} type="number" min="12" max="96" value={header.brandFontSizePx} onChange={e => update({ brandFontSizePx: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Peso
            <input className={controlClass} type="number" min="100" max="900" step="100" value={header.brandWeight} onChange={e => update({ brandWeight: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Espaçamento (em)
            <input className={controlClass} type="number" min="-0.2" max="0.5" step="0.01" value={header.brandLetterSpacing} onChange={e => update({ brandLetterSpacing: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <section className="p-5 md:p-6 rounded-[var(--radius-xl)] border-2 border-[var(--color-accent)]/45 bg-[var(--color-surface)] space-y-5 shadow-xs" aria-labelledby="kinetic-title">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-accent)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Creative coding</span>
            </div>
            <h3 id="kinetic-title" className="text-xl font-black mt-1">Tipografia cinética do header</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-2xl">
              Presets paramétricos inspirados em ferramentas de motion e creative coding: movimento por tempo, resposta ao cursor, deformação elástica e profundidade 3D.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            <span className="px-2 py-1 border border-[var(--color-border)] rounded-full flex items-center gap-1"><Play className="w-3 h-3" /> requestAnimationFrame</span>
            <span className="px-2 py-1 border border-[var(--color-border)] rounded-full flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> pointer</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
          {KINETIC_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => update({ animation: preset.value })}
              className={`p-3 rounded-[var(--radius-md)] border text-left transition-all ${header.animation === preset.value ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/25' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/60'}`}
            >
              <span className="font-black block">{preset.label}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight block mt-1">{preset.description}</span>
            </button>
          ))}
        </div>

        <div
          className="relative min-h-[250px] md:min-h-[300px] overflow-hidden border border-[var(--color-border)] rounded-[var(--radius-lg)] flex items-center justify-center px-5 bg-[var(--color-bg)]"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 55%)' }}
        >
          <KineticBrand
            text={settings.portfolio_name || 'PORTFÓLIO AUTORAL'}
            header={header}
            reducedMotion={reducedMotion}
            preview
            className="max-w-full"
          />
          <span className="absolute left-3 bottom-3 text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Preview ao vivo — mova o cursor e clique sobre o nome</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 text-xs">
          <label className="space-y-1 block">
            <span className="font-semibold">Intensidade: {header.animationIntensity.toFixed(1)}x</span>
            <input className={sliderClass} type="range" min="0" max="3" step="0.1" value={header.animationIntensity} onChange={e => update({ animationIntensity: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 block">
            <span className="font-semibold">Velocidade: {header.animationSpeed.toFixed(1)}x</span>
            <input className={sliderClass} type="range" min="0" max="4" step="0.1" value={header.animationSpeed} onChange={e => update({ animationSpeed: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 block">
            <span className="font-semibold">Profundidade 3D: {header.animationDepthPx}px</span>
            <input className={sliderClass} type="range" min="0" max="120" step="2" value={header.animationDepthPx} onChange={e => update({ animationDepthPx: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 block">
            <span className="font-semibold">Dispersão entre letras: {header.animationSpread.toFixed(1)}x</span>
            <input className={sliderClass} type="range" min="0.1" max="3" step="0.1" value={header.animationSpread} onChange={e => update({ animationSpread: Number(e.target.value) })} />
          </label>
          <label className="space-y-1 block">
            <span className="font-semibold">Comportamento de cor</span>
            <select className={controlClass} value={header.animationColorMode} onChange={e => update({ animationColorMode: e.target.value as HeaderAnimationColorMode })}>
              <option value="theme">Tema / acento ao interagir</option>
              <option value="accent">Sempre na cor de acento</option>
              <option value="alternating">Alternar tema + acento</option>
              <option value="pulse">Pulso cromático</option>
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
            <label className="flex items-center gap-2 p-3 border border-[var(--color-border)] rounded-[var(--radius-md)] cursor-pointer">
              <input type="checkbox" checked={header.animationAutoPlay} onChange={e => update({ animationAutoPlay: e.target.checked })} />
              Movimento automático
            </label>
            <label className="flex items-center gap-2 p-3 border border-[var(--color-border)] rounded-[var(--radius-md)] cursor-pointer">
              <input type="checkbox" checked={header.animationPointer} onChange={e => update({ animationPointer: e.target.checked })} />
              Responder ao cursor
            </label>
          </div>
        </div>

        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
          A preferência <code>prefers-reduced-motion</code> do navegador continua sendo respeitada: quando ativa, o header preserva a tipografia e desliga a cinética automaticamente.
        </p>
      </section>

      <div className={cardClass}>
        <h3 className="font-bold mb-4">Navegação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          {[
            ['simple', 'Simples'],
            ['underline', 'Sublinhado'],
            ['pill', 'Pílula'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => update({ navStyle: value as ThemeHeader['navStyle'] })}
              className={`p-3 rounded-[var(--radius-md)] border text-left ${header.navStyle === value ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}>
              <span className="font-bold">Navegação {label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="text-xs font-semibold space-y-1 block">Tamanho (px)
            <input className={controlClass} type="number" min="8" max="30" value={header.navFontSizePx} onChange={e => update({ navFontSizePx: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Peso
            <input className={controlClass} type="number" min="100" max="900" step="100" value={header.navWeight} onChange={e => update({ navWeight: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Tracking (em)
            <input className={controlClass} type="number" min="0" max="0.8" step="0.01" value={header.navLetterSpacing} onChange={e => update({ navLetterSpacing: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2 p-3 border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm">
            <input type="checkbox" checked={header.navUppercase} onChange={e => update({ navUppercase: e.target.checked })} />
            Maiúsculas
          </label>
        </div>
      </div>
    </div>
  );
};
