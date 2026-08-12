import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_THEME_CONFIG } from '../../services/defaultData';
import { auditThemeContrast, ContrastAuditResult } from '../../lib/contrast';
import { ThemeConfig, CtaLabel, UXVoice } from '../../types/portfolio';
import { Button } from '../common/Button';
import { Toast, ToastMessage } from '../common/Toast';
import { Badge } from '../common/Badge';
import { 
  Palette, 
  Type, 
  Square, 
  LayoutGrid, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Save, 
  ArrowUpRight 
} from 'lucide-react';

interface AppearanceEditorProps {
  onSaved?: () => void;
}

export const AppearanceEditor: React.FC<AppearanceEditorProps> = ({ onSaved }) => {
  const { themeConfig, updateThemeConfig } = useTheme();

  const [config, setConfig] = useState<ThemeConfig>({
    ...DEFAULT_THEME_CONFIG,
    ...themeConfig,
    colors: { ...DEFAULT_THEME_CONFIG.colors, ...(themeConfig?.colors || {}) },
    typography: { ...DEFAULT_THEME_CONFIG.typography, ...(themeConfig?.typography || {}) },
    radius: { ...DEFAULT_THEME_CONFIG.radius, ...(themeConfig?.radius || {}) },
    layout: { ...DEFAULT_THEME_CONFIG.layout, ...(themeConfig?.layout || {}) },
    motion: { ...DEFAULT_THEME_CONFIG.motion, ...(themeConfig?.motion || {}) },
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [loading, setLoading] = useState(false);

  // Perform contrast audit
  const contrastResults: ContrastAuditResult[] = auditThemeContrast(config.colors);
  const hasContrastWarnings = contrastResults.some((r) => !r.passesAA);

  const handleColorChange = (key: keyof typeof config.colors, value: string) => {
    setConfig({
      ...config,
      colors: { ...config.colors, [key]: value },
    });
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_THEME_CONFIG);
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Restaurado para o Padrão',
      message: 'Os tokens foram restaurados para a paleta neutra inicial.',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateThemeConfig(config);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Design System Atualizado',
        message: 'As configurações visuais e tokens de tema foram salvos com sucesso.',
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Erro ao salvar tokens:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Não foi possível salvar o tema.',
      });
    } finally {
      setLoading(false);
    }
  };

  const ctaOptions: CtaLabel[] = [
    'Ver projeto',
    'Explorar',
    'Conhecer',
    'Abrir projeto',
    'Entrar',
    'Descobrir',
  ];

  const voiceOptions: UXVoice[] = [
    'direto',
    'informal',
    'poético',
    'acadêmico',
    'experimental',
    'profissional',
    'acolhedor',
    'minimalista',
  ];

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-accent)]" />
            <span>Design Tokens & Sistema de Aparência</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Configure as variáveis do seu Design System autoral e verifique a conformidade de contraste WCAG 2.2 AA em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleResetDefault}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Padrão Neutro
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Salvar Aparência
          </Button>
        </div>
      </div>

      {/* WCAG Contrast Audit Warning Panel */}
      <div className={`p-5 rounded-[var(--radius-xl)] border shadow-xs transition-colors ${
        hasContrastWarnings
          ? 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5'
          : 'border-[var(--color-success)]/40 bg-[var(--color-success)]/5'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {hasContrastWarnings ? (
              <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
            )}
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Auditoria de Acessibilidade de Contraste (WCAG 2.2 AA)
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5">
            Exigência: ≥ 4.5:1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {contrastResults.map((audit, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-[var(--radius-md)] border text-xs flex items-center justify-between ${
                audit.passesAA
                  ? 'border-[var(--color-success)]/20 bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                  : 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
              }`}
            >
              <div>
                <p className="font-bold">{audit.pair}</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Proporção: <strong className="font-mono">{audit.ratio}:1</strong>
                </p>
                {audit.warning && (
                  <p className="text-[10px] mt-1 font-semibold">{audit.warning}</p>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                audit.passesAA ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
              }`}>
                {audit.passesAA ? 'APROVADO' : 'ALERTA'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Live Preview Box */}
      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md space-y-4 transition-all"
           style={{
             backgroundColor: config.colors.background,
             color: config.colors.textPrimary,
             borderRadius: config.radius.xl,
           }}>
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: config.colors.border }}>
          <span className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: config.colors.accent }}>
            Pré-visualização Interativa do Design System
          </span>
          <Badge variant="outline" size="sm">
            Live Preview
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold" style={{ fontFamily: config.typography.fontFamilyHeadings, color: config.colors.textPrimary }}>
              Título do Projeto Autoral
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: config.colors.textSecondary }}>
              Demonstração de cartão de projeto com o tom de voz <strong>"{config.uxVoice}"</strong> e botão configurado para <strong>"{config.ctaLabel}"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border space-y-3 shadow-xs"
               style={{
                 backgroundColor: config.colors.surface,
                 borderColor: config.colors.border,
                 borderRadius: config.radius.lg,
               }}>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: config.colors.accent + '20', color: config.colors.accent }}>
              Categoria Exemplo
            </span>
            <p className="text-xs font-medium" style={{ color: config.colors.textPrimary }}>
              Cartão de amostragem de superfície
            </p>
            <button
              type="button"
              className="w-full py-2 px-4 text-xs font-bold rounded-[var(--radius-md)] text-white flex items-center justify-between cursor-pointer"
              style={{
                backgroundColor: config.colors.primary,
                borderRadius: config.radius.md,
              }}
            >
              <span>{config.ctaLabel}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Token Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors Token Group */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Tokens de Cores</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(config.colors).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] capitalize">
                  {key}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={val}
                    onChange={(e) => handleColorChange(key as any, e.target.value)}
                    className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleColorChange(key as any, e.target.value)}
                    className="flex-1 px-2 py-1 font-mono text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipografia & Formas */}
        <div className="space-y-6">
          {/* Tipografia */}
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Tipografia & Escala</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[var(--color-text-primary)]">
                  Fonte dos Títulos (Headings)
                </label>
                <select
                  value={config.typography.fontFamilyHeadings}
                  onChange={(e) => setConfig({
                    ...config,
                    typography: { ...config.typography, fontFamilyHeadings: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)]"
                >
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Moderna / Editorial)</option>
                  <option value="Playfair Display, serif">Playfair Display (Serifada Elegante)</option>
                  <option value="Space Grotesk, sans-serif">Space Grotesk (Tecnológica / Brutalista)</option>
                  <option value="Inter, sans-serif">Inter (Neogrotesca Neutra)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[var(--color-text-primary)]">
                  Fonte do Corpo de Texto (Body)
                </label>
                <select
                  value={config.typography.fontFamilyBody}
                  onChange={(e) => setConfig({
                    ...config,
                    typography: { ...config.typography, fontFamilyBody: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)]"
                >
                  <option value="Inter, sans-serif">Inter (Alta Legibilidade)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="JetBrains Mono, monospace">JetBrains Mono (Monospaçada)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Square className="w-4 h-4 text-[var(--color-success)]" />
              <span>Arredondamento de Cantos (Border Radius)</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  radius: { none: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '9999px' }
                })}
                className="p-2 border border-[var(--color-border)] rounded-none text-center font-bold hover:bg-black/5 cursor-pointer"
              >
                Reto / Brutalista
              </button>
              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  radius: { none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' }
                })}
                className="p-2 border border-[var(--color-border)] rounded-md text-center font-bold hover:bg-black/5 cursor-pointer"
              >
                Suave (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  radius: { none: '0px', sm: '8px', md: '16px', lg: '24px', xl: '32px', full: '9999px' }
                })}
                className="p-2 border border-[var(--color-border)] rounded-xl text-center font-bold hover:bg-black/5 cursor-pointer"
              >
                Muito Arredondado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UX Voice & CTA Label Customization */}
      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <span>UX Writing & Tom de Voz Autoral</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <label className="block font-semibold text-[var(--color-text-primary)]">
              Rótulo do Botão de Ação nos Projetos (CTA Label)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ctaOptions.map((cta) => (
                <button
                  key={cta}
                  type="button"
                  onClick={() => setConfig({ ...config, ctaLabel: cta })}
                  className={`p-2 rounded-[var(--radius-md)] border text-center font-medium cursor-pointer transition-all ${
                    config.ctaLabel === cta
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]'
                  }`}
                >
                  {cta}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-[var(--color-text-primary)]">
              Tom de Voz do Portfólio (UX Voice)
            </label>
            <select
              value={config.uxVoice}
              onChange={(e) => setConfig({ ...config, uxVoice: e.target.value as UXVoice })}
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)] font-semibold"
            >
              {voiceOptions.map((voice) => (
                <option key={voice} value={voice}>
                  {voice.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
