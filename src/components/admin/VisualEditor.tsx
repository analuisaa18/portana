import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Database, FileText, FolderOpen, Layers, Loader2, Mail, Monitor, PanelTop,
  Palette, RotateCcw, Save, Smartphone, Sparkles, Square, Type, Upload, User, Wand2,
} from 'lucide-react';
import { useTheme, PREVIEW_MESSAGE } from '../../context/ThemeContext';
import { portfolioStore } from '../../services/store';
import type { ButtonVariantId, DesignConfig, PageId } from '../../types/design';
import { EMPTY_DESIGN } from '../../types/design';
import type { ThemeConfig } from '../../types/portfolio';
import {
  FieldDef, FieldGrid, FontGroupCard, getPath, setPath, stableStringify, useFontCatalog,
} from './designControls';

/**
 * Editor Visual — controla o design real do site público.
 *  • Rascunho = salvo no Supabase (theme_config.designDraft), ainda NÃO visível no site.
 *  • Publicar = grava em theme_config.design (a única coisa que o site público lê).
 *  • A prévia é o site de verdade num iframe (mesma origem), recebendo o design em edição.
 */

type SectionId =
  | 'identity' | 'typography' | 'colors' | 'navbar' | 'home' | 'about' | 'projects' | 'contact' | 'detail'
  | 'buttons' | 'decor' | 'responsive' | 'general';

const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ReactNode; route: string }> = [
  { id: 'identity', label: 'Identidade visual', icon: <Wand2 className="w-4 h-4" />, route: '#/' },
  { id: 'typography', label: 'Tipografia', icon: <Type className="w-4 h-4" />, route: '#/' },
  { id: 'colors', label: 'Cores', icon: <Palette className="w-4 h-4" />, route: '#/' },
  { id: 'navbar', label: 'Navbar', icon: <PanelTop className="w-4 h-4" />, route: '#/' },
  { id: 'home', label: 'Home', icon: <FileText className="w-4 h-4" />, route: '#/' },
  { id: 'about', label: 'Sobre', icon: <User className="w-4 h-4" />, route: '#/sobre' },
  { id: 'projects', label: 'Projetos', icon: <FolderOpen className="w-4 h-4" />, route: '#/projetos' },
  { id: 'contact', label: 'Contato', icon: <Mail className="w-4 h-4" />, route: '#/contato' },
  { id: 'detail', label: 'Página de projeto', icon: <Layers className="w-4 h-4" />, route: '#/projetos' },
  { id: 'buttons', label: 'Botões e componentes', icon: <Square className="w-4 h-4" />, route: '#/' },
  { id: 'decor', label: 'Elementos decorativos', icon: <Sparkles className="w-4 h-4" />, route: '#/' },
  { id: 'responsive', label: 'Responsividade', icon: <Smartphone className="w-4 h-4" />, route: '#/' },
  { id: 'general', label: 'Configurações gerais', icon: <Database className="w-4 h-4" />, route: '#/' },
];

const PREVIEW_PAGES: Array<{ label: string; route: string }> = [
  { label: 'Home', route: '#/' }, { label: 'Sobre', route: '#/sobre' },
  { label: 'Projetos', route: '#/projetos' }, { label: 'Contato', route: '#/contato' },
];

/* ---------- Campos (valores "def" = visual atual do site, usados só como referência na tela) ---------- */

const col = (path: string, label: string, def: string, affects: string): FieldDef => ({ kind: 'color', path, label, def, affects });
const nb = (path: string, label: string, def: number, min: number, max: number, unit: string, affects: string, step = 1): FieldDef =>
  ({ kind: 'number', path, label, def, min, max, unit, affects, step });
const shadowOpts = [{ value: 'none', label: 'Sem sombra' }, { value: 'soft', label: 'Suave' }, { value: 'strong', label: 'Forte' }];

const COLOR_FIELDS: FieldDef[] = [
  col('colors.background', 'Fundo principal', '#090909', 'cor de fundo do site e das páginas (a textura continua por cima)'),
  col('colors.backgroundSecondary', 'Fundo secundário', '#322d2f', 'cartões de contato, campos de formulário, capas e imagens de projeto'),
  col('colors.titles', 'Títulos', '#0a0a0a', 'todos os títulos (PORTFÓLIO, SOBRE MIM, PROJETOS, contato, projeto)'),
  col('colors.text', 'Textos', '#f09ab9', 'parágrafos e textos corridos das páginas'),
  col('colors.textSecondary', 'Textos secundários', '#ed8eae', 'metadados, avisos, legendas e textos de apoio'),
  col('colors.highlight', 'Destaques', '#ed84aa', 'chamadas, rótulos de projeto, item ativo e hover da navbar'),
  col('colors.button', 'Botões', '#090909', 'fundo de TODOS os botões (refine por tipo em "Botões e componentes")'),
  col('colors.buttonText', 'Texto dos botões', '#ffffff', 'texto de todos os botões'),
  col('colors.border', 'Bordas', '#e06f98', 'bordas de cartões, chips e links sociais'),
  col('colors.link', 'Links', '#e986aa', 'links de contato e redes sociais'),
  col('colors.navbar', 'Navbar (fundo)', '#050505', 'fundo da cápsula do menu'),
  col('colors.navbarText', 'Navbar (texto)', '#ffffff', 'nome e itens do menu'),
  col('colors.navbarActive', 'Navbar (item ativo/hover)', '#ed84aa', 'página atual e passagem do mouse no menu'),
  col('colors.decorative', 'Elementos decorativos', '#ec77a2', 'ornamentos ✦ do menu'),
  col('colors.stars', 'Estrelas', '#ffffff', 'todas as estrelas do site (navbar e páginas)'),
  col('colors.sectionHome', 'Fundo da Home (sólido)', '#dc7a9f', 'troca a textura da Home por esta cor'),
  col('colors.sectionAbout', 'Fundo de Sobre (sólido)', '#0d0d0d', 'troca a textura de Sobre por esta cor'),
  col('colors.sectionProjects', 'Fundo de Projetos (sólido)', '#dc7a9f', 'troca a textura de Projetos por esta cor'),
  col('colors.sectionContact', 'Fundo de Contato (sólido)', '#0d0d0d', 'troca a textura de Contato por esta cor'),
  col('colors.sectionDetail', 'Fundo da página de projeto (sólido)', '#0d0d0d', 'troca a textura da página de projeto por esta cor'),
];

const NAV_ITEM_LABELS = ['Item 1 do menu (Sobre)', 'Item 2 do menu (Projetos)', 'Item 3 do menu (Contato)'];
const navFields: FieldDef[] = [
  col('colors.navbar', 'Cor de fundo', '#050505', 'fundo da cápsula do menu'),
  nb('navbar.opacity', 'Transparência (opacidade do fundo)', 1, 0, 1, '', 'fundo da cápsula do menu', 0.05),
  col('colors.navbarText', 'Cor dos textos', '#ffffff', 'nome e itens do menu'),
  col('colors.navbarActive', 'Cor do item ativo/hover', '#ed84aa', 'página atual e hover'),
  nb('navbar.heightPx', 'Altura', 94, 40, 220, 'px', 'altura da cápsula (desktop)'),
  nb('navbar.widthPct', 'Largura', 93, 40, 100, '%', 'largura da cápsula'),
  nb('navbar.topPx', 'Distância do topo', 32, 0, 200, 'px', 'posição vertical da navbar (desktop)'),
  nb('navbar.paddingXPx', 'Espaço interno lateral', 54, 0, 200, 'px', 'margem interna da cápsula'),
  nb('navbar.navGapPx', 'Espaçamento entre itens', 36, 0, 160, 'px', 'distância entre os itens do menu'),
  nb('navbar.brandSizePx', 'Tamanho do nome (marca)', 13, 8, 60, 'px', 'nome ao lado do ícone'),
  col('navbar.borderColor', 'Cor da borda', '#f08bb0', 'contorno da cápsula'),
  nb('navbar.borderWidthPx', 'Espessura da borda', 1, 0, 12, 'px', 'contorno da cápsula'),
  nb('navbar.radiusPx', 'Arredondamento dos cantos', 999, 0, 999, 'px', 'cantos da cápsula (999 = pílula)'),
  { kind: 'select', path: 'navbar.shadow', label: 'Sombra', affects: 'sombra da cápsula', def: 'none', options: shadowOpts },
  nb('navbar.blurPx', 'Desfoque do fundo (blur)', 0, 0, 40, 'px', 'efeito de vidro atrás da navbar'),
];
const navItemFields: FieldDef[] = [1, 2, 3].flatMap((i) => [
  col(`navbar.items.${i}.color`, `${NAV_ITEM_LABELS[i - 1]} — cor`, '#ffffff', `texto do item ${i} (o destino do link não muda)`),
  nb(`navbar.items.${i}.weight`, `${NAV_ITEM_LABELS[i - 1]} — grossura`, 900, 100, 900, '', `texto do item ${i}`, 100),
  nb(`navbar.items.${i}.sizePx`, `${NAV_ITEM_LABELS[i - 1]} — tamanho`, 10, 6, 40, 'px', `texto do item ${i}`),
]);
const navMobileFields: FieldDef[] = [
  nb('navbar.heightMobilePx', 'Altura no celular', 140, 40, 260, 'px', 'altura da cápsula (≤ 767px)'),
  nb('navbar.topMobilePx', 'Distância do topo no celular', 16, 0, 120, 'px', 'posição vertical (≤ 767px)'),
  nb('navbar.navGapMobilePx', 'Espaçamento entre itens no celular', 18, 0, 100, 'px', 'menu (≤ 767px)'),
  nb('navbar.navSizeMobilePx', 'Tamanho dos itens no celular', 10, 6, 40, 'px', 'menu (≤ 767px)'),
  nb('navbar.brandSizeMobilePx', 'Tamanho do nome no celular', 13, 8, 40, 'px', 'marca (≤ 767px)'),
  { kind: 'toggle', path: 'navbar.hideDecorOnMobile', label: 'Ocultar estrelas/ornamentos da navbar no celular', affects: 'estrelas e ✦ da navbar (≤ 767px)' },
];

const PAGE_LABEL: Record<PageId, string> = { home: 'Home', about: 'Sobre', projects: 'Projetos', contact: 'Contato', detail: 'Página de projeto' };
const PAGE_DEFAULTS: Record<PageId, { bg: string; title: string; text: string; titleSize: number; textSize: number; padTop: number }> = {
  home: { bg: '#dc7a9f', title: '#0a0a0a', text: '#0a0a0a', titleSize: 96, textSize: 20, padTop: 0 },
  about: { bg: '#0d0d0d', title: '#ed86ac', text: '#f09ab9', titleSize: 76, textSize: 15, padTop: 178 },
  projects: { bg: '#dc7a9f', title: '#0a0a0a', text: '#0a0a0a', titleSize: 64, textSize: 10, padTop: 180 },
  contact: { bg: '#0d0d0d', title: '#eb82a7', text: '#e986aa', titleSize: 40, textSize: 12, padTop: 165 },
  detail: { bg: '#0d0d0d', title: '#ed86ac', text: '#f6c1d3', titleSize: 72, textSize: 19, padTop: 120 },
};
const pageFields = (id: PageId, mobileOnly?: boolean): FieldDef[] => {
  const k = `pages.${id}`; const dft = PAGE_DEFAULTS[id]; const L = PAGE_LABEL[id];
  const mobile = [
    nb(`${k}.titleSizeMobilePx`, 'Tamanho do título no celular', Math.round(dft.titleSize * 0.6), 10, 300, 'px', `título de ${L} (≤ 767px)`),
    nb(`${k}.textSizeMobilePx`, 'Tamanho dos textos no celular', Math.max(8, Math.round(dft.textSize * 0.9)), 6, 100, 'px', `textos de ${L} (≤ 767px)`),
    nb(`${k}.paddingTopMobilePx`, 'Espaço no topo no celular', 150, 0, 500, 'px', `margem superior de ${L} (≤ 767px)`),
  ];
  if (mobileOnly) return mobile;
  const f: FieldDef[] = [
    col(`${k}.background`, 'Cor de fundo (sólida)', dft.bg, `fundo de ${L} (substitui a textura só desta página)`),
    col(`${k}.titleColor`, 'Cor do título', dft.title, `título de ${L}`),
    col(`${k}.textColor`, 'Cor dos textos', dft.text, `textos de ${L}`),
    col(`${k}.accentColor`, 'Cor de destaque', '#ed84aa', `chamadas/rótulos de ${L}`),
    nb(`${k}.titleSizePx`, 'Tamanho do título (desktop)', dft.titleSize, 10, 400, 'px', `título de ${L}`),
    nb(`${k}.titleWeight`, 'Grossura do título', 700, 100, 900, '', `título de ${L}`, 100),
    nb(`${k}.textSizePx`, 'Tamanho dos textos (desktop)', dft.textSize, 6, 120, 'px', `textos de ${L}`),
    nb(`${k}.paddingTopPx`, 'Espaço no topo', dft.padTop || 100, 0, 600, 'px', `margem superior de ${L}`),
    nb(`${k}.paddingBottomPx`, 'Espaço embaixo', 100, 0, 600, 'px', `margem inferior de ${L}`),
    nb(`${k}.paddingXPct`, 'Margem lateral', 9, 0, 30, '%', `margens laterais de ${L}`),
    { kind: 'select', path: `${k}.align`, label: 'Alinhamento do texto', affects: `texto de ${L}`, def: 'left', options: [{ value: 'left', label: 'Esquerda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Direita' }] },
    nb(`${k}.radiusPx`, 'Arredondamento (cartões/imagens)', 0, 0, 200, 'px', `cartões e imagens de ${L}`),
    col(`${k}.borderColor`, 'Cor das bordas', '#e06f98', `bordas de ${L}`),
    ...mobile,
  ];
  if (id === 'projects') f.push(nb(`${k}.gapPx`, 'Espaço entre cartões', 56, 0, 200, 'px', 'grade de projetos'));
  if (id === 'home' || id === 'about') {
    f.push(nb(`${k}.offsetXPx`, 'Deslocar texto na horizontal', 0, -600, 600, 'px', `bloco de texto de ${L}`));
    f.push(nb(`${k}.offsetYPx`, 'Deslocar texto na vertical', 0, -600, 600, 'px', `bloco de texto de ${L}`));
  }
  return f;
};

const BUTTON_LABEL: Record<ButtonVariantId, { label: string; where: string; bg: string; fg: string }> = {
  primary: { label: 'Botão principal (preto)', where: '"Ver projetos" e botões escuros', bg: '#090909', fg: '#ffffff' },
  accent: { label: 'Botão de destaque (rosa)', where: '"Vamos conversar" e botões rosa', bg: '#ed83aa', fg: '#0a0a0a' },
  submit: { label: 'Botão de envio (formulário)', where: '"Enviar pelo WhatsApp"', bg: '#36a465', fg: '#ffffff' },
};
const buttonFields = (id: ButtonVariantId): FieldDef[] => {
  const k = `buttons.${id}`; const b = BUTTON_LABEL[id]; const w = b.where;
  return [
    col(`${k}.background`, 'Cor de fundo', b.bg, w), col(`${k}.color`, 'Cor do texto', b.fg, w),
    nb(`${k}.sizePx`, 'Tamanho da fonte', 11, 6, 60, 'px', w), nb(`${k}.weight`, 'Grossura da fonte', 900, 100, 900, '', w, 100),
    nb(`${k}.minHeightPx`, 'Altura mínima', 42, 0, 200, 'px', w), nb(`${k}.minWidthPx`, 'Largura mínima', 0, 0, 600, 'px', w),
    nb(`${k}.paddingYPx`, 'Espaço interno vertical', 15, 0, 80, 'px', w), nb(`${k}.paddingXPx`, 'Espaço interno horizontal', 21, 0, 160, 'px', w),
    col(`${k}.borderColor`, 'Cor da borda', '#e06f98', w), nb(`${k}.borderWidthPx`, 'Espessura da borda', 0, 0, 12, 'px', w),
    nb(`${k}.radiusPx`, 'Arredondamento', 0, 0, 999, 'px', w),
    { kind: 'select', path: `${k}.shadow`, label: 'Sombra', affects: w, def: 'none', options: shadowOpts },
    col(`${k}.hoverBackground`, 'Hover — cor de fundo', b.bg, `${w} (ao passar o mouse)`), col(`${k}.hoverColor`, 'Hover — cor do texto', b.fg, `${w} (ao passar o mouse)`),
    nb(`${k}.hoverLiftPx`, 'Hover — elevação', 2, 0, 30, 'px', `${w} (ao passar o mouse)`), nb(`${k}.transitionMs`, 'Transição', 200, 0, 2000, 'ms', `${w} (velocidade do hover)`, 10),
  ];
};

const FONT_GROUPS = [
  { group: 'main' as const, title: 'Fonte principal do site', affects: 'todo o texto que não tem fonte própria', sample: 'Design de interfaces, projetos gráficos e experiências visuais.', defaults: { sizePx: 16, weight: 400, lineHeight: 1.6, letterSpacingEm: 0 }, hideSize: true },
  { group: 'headings' as const, title: 'Títulos', affects: 'PORTFÓLIO, SOBRE MIM, PROJETOS, título de contato e de projeto', sample: 'PORTFÓLIO', defaults: { sizePx: 64, weight: 700, lineHeight: 0.9, letterSpacingEm: -0.05 } },
  { group: 'subheadings' as const, title: 'Subtítulos', affects: 'subtítulo da home, texto de abertura de Sobre e títulos de cartões', sample: 'Atuo na interseção entre design e acessibilidade digital.', defaults: { sizePx: 18, weight: 700, lineHeight: 1.3, letterSpacingEm: 0 } },
  { group: 'body' as const, title: 'Parágrafos', affects: 'textos corridos, formulário, metadados e avisos', sample: 'Trabalho desenvolvendo sistemas digitais onde conteúdo e tipografia caminham juntos.', defaults: { sizePx: 15, weight: 400, lineHeight: 1.45, letterSpacingEm: 0 } },
  { group: 'buttons' as const, title: 'Botões', affects: '"Ver projetos", "Vamos conversar", envio do formulário e "voltar"', sample: 'VER PROJETOS', defaults: { sizePx: 11, weight: 900, lineHeight: 1.2, letterSpacingEm: 0.01 } },
  { group: 'navbar' as const, title: 'Navbar', affects: 'nome e itens do menu', sample: 'SOBRE · PROJETOS · CONTATO', defaults: { sizePx: 10, weight: 900, lineHeight: 1.2, letterSpacingEm: 0.03 } },
  { group: 'highlight' as const, title: 'Textos de destaque', affects: 'rótulos de projeto, chips e links sociais', sample: 'IDENTIDADE VISUAL', defaults: { sizePx: 12, weight: 800, lineHeight: 1.2, letterSpacingEm: 0 } },
];

type SaveState = { kind: 'idle' } | { kind: 'saving'; what: 'draft' | 'publish' } | { kind: 'ok'; msg: string } | { kind: 'error'; msg: string };

export const VisualEditor: React.FC<{ onOpenAppearance?: () => void }> = ({ onOpenAppearance }) => {
  const { themeConfig, updateThemeConfig, reloadSettings } = useTheme();
  const catalog = useFontCatalog();

  const published = themeConfig.design ?? EMPTY_DESIGN;
  const savedDraft = themeConfig.designDraft;
  const baseline = savedDraft ?? published;

  const [work, setWork] = useState<DesignConfig>(() => structuredClone(baseline));
  const [section, setSection] = useState<SectionId>('typography');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewRoute, setPreviewRoute] = useState('#/');
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  const [importText, setImportText] = useState('');

  const dirty = stableStringify(work) !== stableStringify(baseline);
  const draftPending = !dirty && Boolean(savedDraft) && stableStringify(savedDraft) !== stableStringify(published);
  const status = dirty ? 'unsaved' : draftPending ? 'draft' : 'published';

  const onChange = useCallback((path: string, value: unknown) => {
    setWork((prev) => setPath(prev, path, value));
    setSave((s) => (s.kind === 'ok' || s.kind === 'error' ? { kind: 'idle' } : s));
  }, []);

  // Aviso antes de sair com alterações não salvas.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  /* ----- Prévia: o site real num iframe, recebendo o design em edição ----- */
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);
  const previewTheme = useMemo<ThemeConfig>(() => ({ ...themeConfig, design: work, designDraft: undefined }), [themeConfig, work]);

  const post = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, themeConfig: previewTheme }, window.location.origin);
  }, [previewTheme]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === 'portana:preview-ready') { setFrameReady(true); post(); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [post]);
  useEffect(() => { if (frameReady) { const t = window.setTimeout(post, 80); return () => window.clearTimeout(t); } }, [post, frameReady]);
  useEffect(() => {
    const w = iframeRef.current?.contentWindow;
    if (!w || !frameReady) return;
    try { if (w.location.hash !== previewRoute) w.location.hash = previewRoute; } catch { /* mesma origem; ignora */ }
  }, [previewRoute, frameReady]);

  const frameSrc = useMemo(() => `${window.location.pathname}?portana-preview=1#/`, []);
  const goSection = (s: SectionId) => {
    setSection(s);
    const r = SECTIONS.find((x) => x.id === s)?.route;
    if (r && ['home', 'about', 'projects', 'contact', 'detail'].includes(s)) setPreviewRoute(r);
  };

  /* ----- Persistência: grava no Supabase e CONFIRMA lendo de volta antes de dizer "sucesso" ----- */
  const persist = async (what: 'draft' | 'publish') => {
    setSave({ kind: 'saving', what });
    try {
      const next: ThemeConfig = what === 'publish'
        ? { ...themeConfig, design: work, designDraft: undefined }
        : { ...themeConfig, designDraft: work };
      await updateThemeConfig(next, { includeDesign: true });
      const fresh = await portfolioStore.getSettings();
      const stored = what === 'publish' ? fresh.theme_config.design : fresh.theme_config.designDraft;
      if (stableStringify(stored ?? EMPTY_DESIGN) !== stableStringify(work)) {
        throw new Error('O banco respondeu, mas os dados lidos de volta são diferentes dos enviados. Nada foi confirmado — tente novamente.');
      }
      setSave({ kind: 'ok', msg: what === 'publish' ? 'Publicado: gravado no Supabase e já visível no site.' : 'Rascunho gravado no Supabase (ainda não está no site).' });
    } catch (err) {
      setSave({ kind: 'error', msg: `Não foi possível salvar: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const discard = () => { setWork(structuredClone(baseline)); setSave({ kind: 'idle' }); };
  const resetAll = () => { if (window.confirm('Remover TODAS as personalizações do rascunho e voltar ao visual original? (nada muda no site até você publicar)')) setWork(structuredClone(EMPTY_DESIGN)); };
  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) throw new Error('JSON inválido (esperado "version": 1).');
      setWork({ ...structuredClone(EMPTY_DESIGN), ...parsed });
      setImportText(''); setSave({ kind: 'idle' });
    } catch (e) { setSave({ kind: 'error', msg: `Importação falhou: ${e instanceof Error ? e.message : String(e)}` }); }
  };
  const countSet = useMemo(() => {
    const count = (o: unknown): number => (o && typeof o === 'object' ? Object.values(o as object).reduce((a: number, v) => a + count(v), 0) : o === undefined ? 0 : 1);
    return count({ ...work, version: undefined });
  }, [work]);

  const common = { design: work, onChange };
  const busy = save.kind === 'saving';

  const renderSection = () => {
    switch (section) {
      case 'identity': return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Paleta-base, raios de borda, ícone da marca e imagem de tema ficam na aba <strong>Aparência & Design System</strong>. Tudo o que você personaliza aqui é aplicado <em>por cima</em> dela e só onde você mexer.</p>
          {onOpenAppearance && <button type="button" onClick={onOpenAppearance} className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)]">Abrir Aparência & Design System</button>}
          <FieldGrid {...common} title="Cores-chave da identidade" description="Atalhos para as cores que mais definem o visual." fields={COLOR_FIELDS.filter((f) => ['colors.titles', 'colors.highlight', 'colors.button', 'colors.stars', 'colors.navbar', 'colors.border'].includes(f.path))} />
        </div>);
      case 'typography': return (
        <div className="space-y-4">
          {FONT_GROUPS.map((g) => <FontGroupCard key={g.group} id={g.group} {...g} design={work} catalog={catalog} onChange={onChange} />)}
        </div>);
      case 'colors': return <FieldGrid {...common} title="Sistema de cores" description="Clique no quadrado para escolher a cor ou digite o HEX. ↺ volta ao valor original." fields={COLOR_FIELDS} />;
      case 'navbar': return (
        <div className="space-y-4">
          <FieldGrid {...common} title="Aparência" fields={navFields} />
          <FieldGrid {...common} title="Itens do menu (individual)" description="Só a aparência; destinos e textos dos links continuam como estão." fields={navItemFields} />
          <FieldGrid {...common} title="Comportamento no celular" fields={navMobileFields} />
          <p className="text-xs text-[var(--color-text-secondary)]">Fonte da navbar: aba <strong>Tipografia → Navbar</strong>. As estrelas continuam funcionando; a cor delas está em <strong>Elementos decorativos</strong>.</p>
        </div>);
      case 'home': case 'about': case 'projects': case 'contact': case 'detail':
        return <FieldGrid {...common} title={`Página: ${PAGE_LABEL[section as PageId]}`} description="Só afeta esta página. Valores vazios mantêm o visual original." fields={pageFields(section as PageId)} />;
      case 'buttons': return (
        <div className="space-y-4">
          {(['primary', 'accent', 'submit'] as ButtonVariantId[]).map((id) => (
            <FieldGrid key={id} {...common} title={BUTTON_LABEL[id].label} description={`Onde aparece: ${BUTTON_LABEL[id].where}.`} fields={buttonFields(id)} />
          ))}
        </div>);
      case 'decor': return (
        <FieldGrid {...common} title="Elementos decorativos" description="O movimento das estrelas (magnético na navbar etc.) não é alterado — só a cor."
          fields={COLOR_FIELDS.filter((f) => ['colors.decorative', 'colors.stars'].includes(f.path))} />);
      case 'responsive': return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Valores específicos para telas até 767px. Mudar aqui <strong>não</strong> altera o desktop.</p>
          <FieldGrid {...common} title="Navbar no celular" fields={navMobileFields} />
          {(['home', 'about', 'projects', 'contact', 'detail'] as PageId[]).map((id) => (
            <FieldGrid key={id} {...common} title={`${PAGE_LABEL[id]} no celular`} fields={pageFields(id, true)} />
          ))}
          <FieldGrid {...common} title="Tamanho da fonte por grupo no celular" description="Também disponível dentro de cada grupo em Tipografia."
            fields={FONT_GROUPS.filter((g) => !g.hideSize).map((g): FieldDef => ({ kind: 'number', path: `fonts.${g.group}.sizeMobilePx`, label: `${g.title} (celular)`, def: Math.max(8, Math.round(g.defaults.sizePx * 0.8)), min: 8, max: 160, step: 1, unit: 'px', affects: g.affects }))} />
        </div>);
      case 'general': return (
        <div className="space-y-4">
          <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface)] space-y-3">
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">Estado atual</h3>
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <li>Personalizações definidas no rascunho em edição: <strong>{countSet}</strong></li>
              <li>Publicado no site: <strong>{Object.keys(published.fonts).length + Object.keys(published.colors).length + Object.keys(published.navbar).length + Object.keys(published.pages).length + Object.keys(published.buttons).length > 0 ? 'com personalizações' : 'visual original (sem personalizações)'}</strong></li>
              <li>Onde fica salvo: Supabase → tabela <code>portfolio_settings</code> → <code>theme_config.design</code> (publicado) e <code>theme_config.designDraft</code> (rascunho).</li>
            </ul>
            <button type="button" onClick={resetAll} className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] border border-[var(--color-error)] text-[var(--color-error)] flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Voltar tudo ao visual original (rascunho)</button>
          </section>
          <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface)] space-y-3">
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">Exportar / importar</h3>
            <textarea readOnly value={JSON.stringify(work, null, 2)} aria-label="Design atual em JSON" className="w-full h-32 text-[11px] font-mono p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]" />
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Cole aqui um JSON exportado para importar…" aria-label="Importar JSON" className="w-full h-24 text-[11px] font-mono p-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]" />
            <button type="button" onClick={doImport} disabled={!importText.trim()} className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] border border-[var(--color-border)] flex items-center gap-2 disabled:opacity-40 text-[var(--color-text-primary)]"><Upload className="w-4 h-4" /> Importar para o rascunho</button>
          </section>
        </div>);
    }
  };

  const statusBadge = {
    unsaved: { cls: 'bg-amber-500/15 text-amber-500 border-amber-500/40', text: 'Alterações não salvas' },
    draft: { cls: 'bg-sky-500/15 text-sky-400 border-sky-500/40', text: 'Rascunho salvo — não publicado' },
    published: { cls: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40', text: 'Publicado no site' },
  }[status];

  return (
    <div className="space-y-5 animate-fade-in" data-testid="visual-editor">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)]"><Wand2 className="w-5 h-5" /><span className="text-xs font-black uppercase tracking-[0.2em]">Editor visual</span></div>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] mt-1">Design do portfólio</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">Tudo o que você publicar aqui é gravado no Supabase e aplicado ao site. A prévia ao lado é o site real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span data-testid="save-status" className={`px-3 py-1.5 text-xs font-bold rounded-full border ${statusBadge.cls}`}>{statusBadge.text}</span>
          <button type="button" onClick={discard} disabled={!dirty || busy} className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-40">Descartar</button>
          <button type="button" data-testid="save-draft" onClick={() => persist('draft')} disabled={!dirty || busy} className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] border border-[var(--color-primary)] text-[var(--color-primary)] flex items-center gap-2 disabled:opacity-40">
            {save.kind === 'saving' && save.what === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar rascunho
          </button>
          <button type="button" data-testid="publish" onClick={() => persist('publish')} disabled={(status === 'published') || busy} className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white flex items-center gap-2 disabled:opacity-40">
            {save.kind === 'saving' && save.what === 'publish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Publicar no site
          </button>
        </div>
      </div>

      {save.kind === 'ok' && <div role="status" data-testid="save-ok" className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-sm"><CheckCircle2 className="w-4 h-4" />{save.msg}</div>}
      {save.kind === 'error' && <div role="alert" data-testid="save-error" className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 text-red-400 text-sm"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{save.msg} <button type="button" className="underline ml-1" onClick={() => void reloadSettings()}>Recarregar do banco</button></span></div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,520px)]">
        <div className="space-y-4 min-w-0">
          <nav aria-label="Categorias do editor" className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id} type="button" onClick={() => goSection(s.id)} aria-current={section === s.id ? 'page' : undefined}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border flex items-center gap-1.5 ${section === s.id ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-black/10'}`}
              >{s.icon}{s.label}</button>
            ))}
          </nav>
          {renderSection()}
        </div>

        <aside className="xl:sticky xl:top-4 self-start space-y-2" aria-label="Pré-visualização">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {PREVIEW_PAGES.map((p) => (
                <button key={p.route} type="button" onClick={() => setPreviewRoute(p.route)} className={`px-2.5 py-1 text-xs rounded border ${previewRoute === p.route ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'}`}>{p.label}</button>
              ))}
            </div>
            <div className="flex gap-1">
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} className={`p-1.5 rounded border ${device === 'desktop' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'}`} title="Desktop"><Monitor className="w-4 h-4" /></button>
              <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} className={`p-1.5 rounded border ${device === 'mobile' ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'}`} title="Celular"><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>
          <PreviewFrame ref={iframeRef} src={frameSrc} device={device} />
          <p className="text-[11px] text-[var(--color-text-secondary)]">Prévia = site real com o design em edição. Só vai para o site depois de <strong>Publicar</strong>.</p>
        </aside>
      </div>
    </div>
  );
};

const PreviewFrame = React.forwardRef<HTMLIFrameElement, { src: string; device: 'desktop' | 'mobile' }>(({ src, device }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(520);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 520));
    ro.observe(el); setW(el.clientWidth || 520);
    return () => ro.disconnect();
  }, []);
  const vw = device === 'desktop' ? 1440 : 390;
  const vh = device === 'desktop' ? 900 : 780;
  const scale = Math.min(1, w / vw);
  return (
    <div ref={box} className="w-full border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden bg-black" style={{ height: vh * scale }}>
      <iframe
        ref={ref} src={src} title="Pré-visualização do portfólio" data-testid="preview-frame"
        style={{ width: vw, height: vh, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', marginLeft: device === 'mobile' ? Math.max(0, (w - vw * scale) / 2 / scale) : 0 }}
      />
    </div>
  );
});
PreviewFrame.displayName = 'PreviewFrame';
