import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_THEME_CONFIG } from '../../services/defaultData';
import { auditThemeContrast, ContrastAuditResult } from '../../lib/contrast';
import { ThemeConfig, CtaLabel, UXVoice, IconProvider, ThemeIcon } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { Button } from '../common/Button';
import { Toast, ToastMessage } from '../common/Toast';
import { Badge } from '../common/Badge';
import { ThemeIcon as ThemeIconPreview } from '../common/ThemeIcon';
import {
  Palette, Type, Square, Sparkles, CheckCircle2, AlertTriangle, RotateCcw,
  Save, Upload, Image as ImageIcon, Search, Shapes, RefreshCw
} from 'lucide-react';

interface AppearanceEditorProps { onSaved?: () => void; }

type FontItem = { family: string };

const FONT_FALLBACKS: FontItem[] = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito',
  'Raleway', 'Oswald', 'Merriweather', 'Playfair Display', 'Source Sans 3',
  'Space Grotesk', 'Plus Jakarta Sans', 'DM Sans', 'Manrope', 'Outfit',
  'Work Sans', 'Figtree', 'Rubik', 'Bebas Neue', 'Archivo', 'Barlow',
  'IBM Plex Sans', 'IBM Plex Serif', 'JetBrains Mono', 'Roboto Mono', 'Syne',
  'Lilita One',
].map(family => ({ family }));

const ICON_PROVIDERS: Array<{ id: IconProvider; label: string; collection: string; example: string }> = [
  { id: 'material', label: 'Google Material Symbols', collection: 'material-symbols', example: 'home' },
  { id: 'apple', label: 'Apple / Simple Icons', collection: 'simple-icons', example: 'apple' },
  { id: 'feather', label: 'Feather Icons', collection: 'feather', example: 'activity' },
];

const normalizeGoogleFonts = (raw: string): FontItem[] => {
  try {
    const clean = raw.replace(/^\)\]}'\s*/, '');
    const data = JSON.parse(clean);
    const items = Array.isArray(data)
      ? data
      : (data.familyMetadataList || data.items || data.families || Object.values(data));

    const families = items
      .map((item: any) => typeof item === 'string' ? item : (item?.family || item?.name))
      .filter((family: unknown): family is string => typeof family === 'string' && family.trim().length > 0);

    // Garante também a presença de fontes importantes mesmo se o mirror estiver
    // temporariamente indisponível ou atrasado em relação ao catálogo.
    return Array.from(new Set([...families, ...FONT_FALLBACKS.map(font => font.family)]))
      .sort((a, b) => a.localeCompare(b))
      .map(family => ({ family }));
  } catch {
    return FONT_FALLBACKS;
  }
};

const iconUrl = (icon: ThemeIcon) => {
  if (icon.provider === 'custom' && icon.url) return icon.url;
  const collection = icon.provider === 'material' ? 'material-symbols' : icon.provider === 'apple' ? 'simple-icons' : icon.provider === 'feather' ? 'feather' : '';
  return collection && icon.name ? `https://api.iconify.design/${collection}:${encodeURIComponent(icon.name)}.svg?color=currentColor` : '';
};

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
    brandIcon: { ...DEFAULT_THEME_CONFIG.brandIcon, ...(themeConfig?.brandIcon || {}) },
    customImage: themeConfig?.customImage || '',
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [fonts, setFonts] = useState<FontItem[]>(FONT_FALLBACKS);
  const [fontsLoading, setFontsLoading] = useState(true);
  const [iconNames, setIconNames] = useState<Record<string, string[]>>({});
  const [iconsLoading, setIconsLoading] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    let active = true;
    // O endpoint oficial de metadata não permite CORS direto no navegador.
    // Este mirror público é atualizado a partir do catálogo do Google Fonts e
    // contém a lista completa de famílias, sem exigir API key.
    fetch('https://cdn.jsdelivr.net/gh/fontsource/google-font-metadata@main/data/google-fonts-v1.json')
      .then(r => r.text())
      .then(text => {
        if (!active) return;
        const loaded = normalizeGoogleFonts(text);
        if (loaded.length) setFonts(loaded.sort((a, b) => a.family.localeCompare(b.family)));
      })
      .catch(() => {})
      .finally(() => active && setFontsLoading(false));
    return () => { active = false; };
  }, []);

  const loadIcons = async (provider: typeof ICON_PROVIDERS[number]) => {
    if (iconNames[provider.id]) return;
    setIconsLoading(true);
    try {
      const response = await fetch(`https://api.iconify.design/collection?prefix=${provider.collection}`);
      const data = await response.json();
      const names = Array.isArray(data.uncategorized) ? data.uncategorized : Object.values(data.categories || {}).flat();
      const all = Array.from(new Set((names as string[]).filter(Boolean))).sort();
      setIconNames(prev => ({ ...prev, [provider.id]: all }));
    } catch {
      const fallback = provider.id === 'material'
        ? ['home', 'person', 'mail', 'search', 'menu', 'close', 'favorite', 'star', 'settings', 'work', 'school', 'image', 'code', 'arrow_forward', 'open_in_new']
        : provider.id === 'feather'
          ? ['activity', 'camera', 'code', 'edit', 'github', 'heart', 'home', 'image', 'mail', 'menu', 'search', 'settings', 'star', 'user', 'x']
          : ['apple'];
      setIconNames(prev => ({ ...prev, [provider.id]: fallback }));
    } finally { setIconsLoading(false); }
  };

  const contrastResults: ContrastAuditResult[] = auditThemeContrast(config.colors);
  const hasContrastWarnings = contrastResults.some(r => !r.passesAA);

  const handleColorChange = (key: keyof typeof config.colors, value: string) =>
    setConfig(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));

  const updateTypography = (patch: Partial<ThemeConfig['typography']>) =>
    setConfig(prev => ({ ...prev, typography: { ...prev.typography, ...patch } }));

  const updateBrandIcon = (patch: Partial<ThemeIcon>) =>
    setConfig(prev => ({ ...prev, brandIcon: { ...prev.brandIcon, ...patch } }));

  const handleResetDefault = () => {
    setConfig(JSON.parse(JSON.stringify(DEFAULT_THEME_CONFIG)));
    setToast({ id: Date.now().toString(), type: 'info', title: 'Restaurado para o Padrão', message: 'As configurações visuais foram restauradas.' });
  };

  const handleUpload = async (file: File, target: 'icon' | 'image') => {
    setLoading(true);
    try {
      const url = await portfolioStore.uploadFile(file, target === 'icon' ? 'appearance/icons' : 'appearance/images');
      if (target === 'icon') updateBrandIcon({ provider: 'custom', name: file.name, url, alt: file.name });
      else setConfig(prev => ({ ...prev, customImage: url }));
      setToast({ id: Date.now().toString(), type: 'success', title: 'Arquivo enviado', message: 'O arquivo foi carregado e está disponível na personalização.' });
    } catch (err) {
      console.error(err);
      setToast({ id: Date.now().toString(), type: 'error', title: 'Erro no upload', message: 'Não foi possível enviar o arquivo.' });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateThemeConfig(config);
      setToast({ id: Date.now().toString(), type: 'success', title: 'Design System Atualizado', message: 'Cores, tipografia, ícones e imagens foram salvos.' });
      onSaved?.();
    } catch (err) {
      console.error(err);
      setToast({ id: Date.now().toString(), type: 'error', title: 'Erro ao Salvar', message: 'Não foi possível salvar o tema.' });
    } finally { setLoading(false); }
  };

  const ctaOptions: CtaLabel[] = ['Ver projeto', 'Explorar', 'Conhecer', 'Abrir projeto', 'Entrar', 'Descobrir'];
  const voiceOptions: UXVoice[] = ['direto', 'informal', 'poético', 'acadêmico', 'experimental', 'profissional', 'acolhedor', 'minimalista'];
  const activeProvider = ICON_PROVIDERS.find(p => p.id === config.brandIcon.provider);
  const filteredIcons = useMemo(() => {
    if (!activeProvider) return [];
    return (iconNames[activeProvider.id] || []).filter(name => name.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 120);
  }, [activeProvider, iconNames, iconSearch]);

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2"><Palette className="w-5 h-5 text-[var(--color-accent)]" /> Sistema de Aparência</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Personalize cores, hierarquia tipográfica, fontes Google, ícones e imagens sem alterar o restante do portfólio.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={handleResetDefault} icon={<RotateCcw className="w-4 h-4" />}>Padrão</Button>
          <Button type="button" variant="primary" onClick={handleSave} isLoading={loading} icon={<Save className="w-4 h-4" />}>Salvar Aparência</Button>
        </div>
      </div>

      <div className={`p-5 rounded-[var(--radius-xl)] border ${hasContrastWarnings ? 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5' : 'border-[var(--color-success)]/40 bg-[var(--color-success)]/5'}`}>
        <div className="flex items-center gap-2 mb-3">
          {hasContrastWarnings ? <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" /> : <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />}
          <h3 className="text-sm font-bold">Auditoria de Contraste WCAG 2.2 AA</h3>
          <span className="ml-auto text-xs font-mono px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5">≥ 4.5:1</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contrastResults.map((audit, idx) => <div key={idx} className="p-3 rounded-[var(--radius-md)] border text-xs flex items-center justify-between bg-[var(--color-surface)]">
            <div><p className="font-bold">{audit.pair}</p><p className="text-[11px] opacity-80">Proporção: <strong>{audit.ratio}:1</strong></p></div>
            <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${audit.passesAA ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'}`}>{audit.passesAA ? 'APROVADO' : 'ALERTA'}</span>
          </div>)}
        </div>
      </div>

      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-md space-y-4" style={{ backgroundColor: config.colors.background, color: config.colors.textPrimary, borderRadius: config.radius.xl }}>
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: config.colors.border }}><span className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color: config.colors.accent }}>Pré-visualização</span><Badge variant="outline" size="sm">Live Preview</Badge></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3"><h3 className="font-bold" style={{ fontFamily: config.typography.fontFamilyHeadings, fontSize: `${config.typography.baseSizePx * Math.pow(config.typography.scaleRatio, 2)}px`, lineHeight: config.typography.headingLineHeight, fontWeight: config.typography.headingWeight }}>{'Título do Projeto Autoral'}</h3><p className="leading-relaxed" style={{ color: config.colors.textSecondary, fontFamily: config.typography.fontFamilyBody, fontSize: `${config.typography.baseSizePx}px`, fontWeight: config.typography.bodyWeight }}>A hierarquia tipográfica e a paleta mudam aqui antes de serem salvas.</p></div>
          <div className="p-4 rounded-[var(--radius-lg)] border space-y-3" style={{ backgroundColor: config.colors.surface, borderColor: config.colors.border, borderRadius: config.radius.lg }}><div className="flex items-center gap-2"><ThemeIconPreview icon={config.brandIcon} className="w-6 h-6 text-[var(--color-accent)]" /><span className="text-xs font-semibold">Ícone da marca</span></div><button type="button" className="w-full py-2 px-4 text-xs font-bold rounded-[var(--radius-md)] text-white" style={{ backgroundColor: config.colors.primary, color: config.colors.background, borderRadius: config.radius.md }}>{config.ctaLabel}</button></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Palette className="w-4 h-4 text-[var(--color-accent)]" /> Sistema de Cores</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(config.colors).map(([key, val]) => <div key={key} className="space-y-1"><label className="block text-[11px] font-semibold capitalize">{key}</label><div className="flex items-center gap-2"><input type="color" value={val} onChange={e => handleColorChange(key as keyof typeof config.colors, e.target.value)} className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] cursor-pointer" /><input type="text" value={val} onChange={e => handleColorChange(key as keyof typeof config.colors, e.target.value)} className="flex-1 px-2 py-1 font-mono text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></div></div>)}
          </div>
        </div>

        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Type className="w-4 h-4 text-[var(--color-primary)]" /> Tipografia & Hierarquia</h3>
          <div className="space-y-4 text-xs">
            <div><label className="block font-semibold mb-1">Fonte dos títulos — Google Fonts</label><input list="google-fonts" value={config.typography.fontFamilyHeadings.split(',')[0].replace(/["']/g, '')} onChange={e => updateTypography({ fontFamilyHeadings: `'${e.target.value}', sans-serif` })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" placeholder={fontsLoading ? 'Carregando catálogo...' : 'Pesquise qualquer Google Font'} /><p className="text-[10px] mt-1 opacity-70">{fonts.length.toLocaleString('pt-BR')} fontes disponíveis no catálogo.</p></div>
            <div><label className="block font-semibold mb-1">Fonte do corpo — Google Fonts</label><input list="google-fonts" value={config.typography.fontFamilyBody.split(',')[0].replace(/["']/g, '')} onChange={e => updateTypography({ fontFamilyBody: `'${e.target.value}', sans-serif` })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" placeholder="Pesquise qualquer Google Font" /></div>
            <datalist id="google-fonts">{fonts.map(font => <option key={font.family} value={font.family} />)}</datalist>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1"><span className="block font-semibold">Tamanho base</span><input type="number" min="10" max="32" step="1" value={config.typography.baseSizePx} onChange={e => updateTypography({ baseSizePx: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
              <label className="space-y-1"><span className="block font-semibold">Razão da escala</span><input type="number" min="1" max="2" step="0.01" value={config.typography.scaleRatio} onChange={e => updateTypography({ scaleRatio: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
              <label className="space-y-1"><span className="block font-semibold">Peso dos títulos</span><input type="number" min="100" max="900" step="100" value={config.typography.headingWeight} onChange={e => updateTypography({ headingWeight: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
              <label className="space-y-1"><span className="block font-semibold">Peso do corpo</span><input type="number" min="100" max="900" step="100" value={config.typography.bodyWeight} onChange={e => updateTypography({ bodyWeight: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
              <label className="space-y-1"><span className="block font-semibold">Entrelinha do corpo</span><input type="number" min="1" max="2.5" step="0.05" value={config.typography.lineHeight} onChange={e => updateTypography({ lineHeight: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
              <label className="space-y-1"><span className="block font-semibold">Entrelinha dos títulos</span><input type="number" min="0.7" max="1.5" step="0.05" value={config.typography.headingLineHeight} onChange={e => updateTypography({ headingLineHeight: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
            </div>
            <label className="space-y-1 block"><span className="block font-semibold">Espaçamento das letras (em)</span><input type="number" min="-0.1" max="0.2" step="0.005" value={config.typography.letterSpacing} onChange={e => updateTypography({ letterSpacing: Number(e.target.value) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5 shadow-xs">
        <h3 className="text-base font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Shapes className="w-4 h-4 text-[var(--color-accent)]" /> Ícones e Imagens Personalizáveis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold mb-2">Ícone principal da marca</label><div className="flex gap-2 flex-wrap">{ICON_PROVIDERS.map(provider => <button key={provider.id} type="button" onClick={() => { updateBrandIcon({ provider: provider.id, name: provider.example, url: undefined }); loadIcons(provider); setIconSearch(''); }} className={`px-3 py-2 text-xs rounded-[var(--radius-md)] border ${config.brandIcon.provider === provider.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold' : 'border-[var(--color-border)]'}`}>{provider.label}</button>)}</div></div>
            {activeProvider && <div className="space-y-3"><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 w-4 h-4 opacity-50" /><input value={iconSearch} onChange={e => setIconSearch(e.target.value)} placeholder={`Pesquisar ícone (${activeProvider.example})`} className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs" /></div><button type="button" onClick={() => loadIcons(activeProvider)} className="px-3 rounded-[var(--radius-md)] border border-[var(--color-border)]" title="Carregar biblioteca">{iconsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shapes className="w-4 h-4" />}</button></div><div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-56 overflow-auto p-1">{filteredIcons.map(name => <button key={name} type="button" title={name} onClick={() => updateBrandIcon({ provider: activeProvider.id, name })} className={`h-11 rounded-[var(--radius-md)] border flex items-center justify-center hover:border-[var(--color-accent)] ${config.brandIcon.name === name ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}><img src={iconUrl({ provider: activeProvider.id, name })} alt="" className="w-6 h-6" /></button>)}</div></div>}
            <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)]"><ThemeIconPreview icon={config.brandIcon} className="w-8 h-8 text-[var(--color-accent)]" /><div className="text-xs"><strong>{config.brandIcon.provider}</strong><div className="opacity-70">{config.brandIcon.name}</div></div></div>
            <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]"><Upload className="w-4 h-4" /> Enviar meu próprio ícone<input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'icon')} /></label>
            {config.brandIcon.provider === 'custom' && <input value={config.brandIcon.url || ''} onChange={e => updateBrandIcon({ url: e.target.value })} placeholder="URL do ícone" className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs" />}
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold">Imagem personalizada / background</label>
            {config.customImage && <img src={config.customImage} alt="Pré-visualização da imagem personalizada" className="w-full h-36 object-cover rounded-[var(--radius-md)] border border-[var(--color-border)]" />}
            <input value={config.customImage} onChange={e => setConfig(prev => ({ ...prev, customImage: e.target.value }))} placeholder="URL da imagem" className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-xs" />
            <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]"><ImageIcon className="w-4 h-4" /> Enviar minha própria imagem<input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} /></label>
            <p className="text-[10px] opacity-70">O arquivo enviado é salvo no Supabase Storage quando o Supabase estiver configurado; sem ele, o portfólio usa o fallback local já existente.</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5 shadow-xs">
        <h3 className="text-base font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Square className="w-4 h-4 text-[var(--color-success)]" /> Arredondamento</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button type="button" onClick={() => setConfig(prev => ({ ...prev, radius: { none: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '9999px' } }))} className="p-2 border border-[var(--color-border)] rounded-none font-bold">Reto / Brutalista</button>
          <button type="button" onClick={() => setConfig(prev => ({ ...prev, radius: { none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' } }))} className="p-2 border border-[var(--color-border)] rounded-md font-bold">Suave</button>
          <button type="button" onClick={() => setConfig(prev => ({ ...prev, radius: { none: '0px', sm: '8px', md: '16px', lg: '24px', xl: '32px', full: '9999px' } }))} className="p-2 border border-[var(--color-border)] rounded-xl font-bold">Muito arredondado</button>
        </div>
      </div>

      <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
        <h3 className="text-base font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--color-accent)]" /> UX Writing & Tom de Voz</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2"><label className="block font-semibold">CTA dos Projetos</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{ctaOptions.map(cta => <button key={cta} type="button" onClick={() => setConfig(prev => ({ ...prev, ctaLabel: cta }))} className={`p-2 rounded-[var(--radius-md)] border ${config.ctaLabel === cta ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)] font-bold' : 'border-[var(--color-border)]'}`}>{cta}</button>)}</div></div>
          <div className="space-y-2"><label className="block font-semibold">Tom de Voz</label><select value={config.uxVoice} onChange={e => setConfig(prev => ({ ...prev, uxVoice: e.target.value as UXVoice }))} className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] font-semibold">{voiceOptions.map(voice => <option key={voice} value={voice}>{voice.toUpperCase()}</option>)}</select></div>
        </div>
      </div>
    </div>
  );
};
