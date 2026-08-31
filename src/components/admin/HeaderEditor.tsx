import React, { useState } from 'react';
import { PanelTop, Save, RotateCcw, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_THEME_CONFIG } from '../../services/defaultData';
import { ThemeHeader } from '../../types/portfolio';

interface HeaderEditorProps {
  onSaved?: () => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ onSaved }) => {
  const { themeConfig, updateThemeConfig } = useTheme();
  const [header, setHeader] = useState<ThemeHeader>({
    ...DEFAULT_THEME_CONFIG.header,
    ...(themeConfig?.header || {}),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const controlClass = 'w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm';
  const cardClass = 'p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <PanelTop className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Personalização</span>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] mt-1">Header</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Controle o cabeçalho do portfólio sem editar código.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="px-4 py-2.5 text-xs font-bold border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Restaurar
          </button>
          <button type="button" onClick={save} disabled={saving} className="px-4 py-2.5 text-xs font-bold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white flex items-center gap-2 disabled:opacity-50">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
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
            <input className={controlClass} type="number" min="48" max="160" value={header.heightPx} onChange={e => update({ heightPx: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Opacidade
            <input className={controlClass} type="number" min="0.5" max="1" step="0.05" value={header.opacity} onChange={e => update({ opacity: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Ícone (px)
            <input className={controlClass} type="number" min="12" max="80" value={header.iconSizePx} onChange={e => update({ iconSizePx: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-bold mb-4">Marca</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="text-xs font-semibold space-y-1 block">Tamanho do nome (px)
            <input className={controlClass} type="number" min="12" max="80" value={header.brandFontSizePx} onChange={e => update({ brandFontSizePx: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Peso
            <input className={controlClass} type="number" min="100" max="900" step="100" value={header.brandWeight} onChange={e => update({ brandWeight: Number(e.target.value) })} />
          </label>
          <label className="text-xs font-semibold space-y-1 block">Espaçamento (em)
            <input className={controlClass} type="number" min="-0.2" max="0.5" step="0.01" value={header.brandLetterSpacing} onChange={e => update({ brandLetterSpacing: Number(e.target.value) })} />
          </label>
        </div>
      </div>

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

      <div className={cardClass}>
        <h3 className="font-bold mb-4">Interação do nome</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ['none', 'Nenhuma'],
            ['lift', 'Elevação'],
            ['wave', 'Onda por letra'],
            ['magnetic', 'Magnética'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => update({ animation: value as ThemeHeader['animation'] })}
              className={`p-3 rounded-[var(--radius-md)] border text-left ${header.animation === value ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}>
              <span className="font-bold block">{label}</span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">Passe o mouse no nome</span>
            </button>
          ))}
        </div>
        <label className="text-xs font-semibold space-y-1 block mt-4 max-w-sm">Intensidade
          <input className="w-full" type="range" min="0" max="2" step="0.1" value={header.animationIntensity} onChange={e => update({ animationIntensity: Number(e.target.value) })} />
          <span className="text-[var(--color-text-secondary)]">{header.animationIntensity.toFixed(1)}x</span>
        </label>
      </div>
    </div>
  );
};
