import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Code2, Copy, Eye, EyeOff, Plus, Save, Sparkles, Trash2, Undo2, Wand2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { normalizeInteractions } from '../../services/normalizers';
import { InteractionsConfig, P5Layer, P5ParamValue, P5Place } from '../../types/portfolio';
import { CUSTOM_CODE_TEMPLATE, P5_PRESETS, P5ParamDef, buildPresetCode, getPreset, presetDefaults } from '../../p5/presets';
import { buildRuntimeHtml } from '../../p5/runtime';
import { layerCode } from '../../p5/P5Layers';
import { ADMIN_BEFORE_LEAVE_EVENT } from './SiteContentEditor';
import pinkPaper from '../../assets/identity/fundo-02-rosa-desktop.png';
import blackPaper from '../../assets/identity/fundo-02-preto-desktop.png';
import grain from '../../assets/identity/fundo-01-desktop.png';

const input = 'w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]';
const card = 'p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4';
const small = 'text-[11px] text-[var(--color-text-secondary)]';
const btn = 'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed';

const PLACES: Array<{ id: P5Place; label: string }> = [
  { id: 'navbar', label: 'Navbar' },
  { id: 'home', label: 'Página inicial' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'contato', label: 'Contato' },
  { id: 'projeto', label: 'Página de cada projeto' },
];

const PREVIEW_BG: Record<P5Place, string> = {
  navbar: '#050505',
  home: `url(${pinkPaper}) center/cover, url(${grain}) center/cover`,
  projetos: `url(${pinkPaper}) center/cover, url(${grain}) center/cover`,
  sobre: `url(${blackPaper}) center/cover, url(${grain}) center/cover`,
  contato: `url(${blackPaper}) center/cover, url(${grain}) center/cover`,
  projeto: `url(${blackPaper}) center/cover, url(${grain}) center/cover`,
};

const newId = () => `camada-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const newLayer = (presetId: string | null): P5Layer => {
  const preset = getPreset(presetId || P5_PRESETS[0].id);
  return {
    id: newId(),
    name: presetId ? preset.name : 'Código livre',
    enabled: true,
    places: ['home'],
    depth: 'fundo',
    opacity: 1,
    showOnMobile: true,
    mode: presetId ? 'preset' : 'code',
    preset: preset.id,
    params: presetDefaults(preset.id),
    code: presetId ? '' : CUSTOM_CODE_TEMPLATE,
  };
};

/* ---------- Prévia interativa ---------- */
const Preview: React.FC<{ layer: P5Layer; place: P5Place; onError: (msg: string) => void }> = ({ layer, place, onError }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const code = layerCode(layer);
  const [debounced, setDebounced] = useState(code);
  const [run, setRun] = useState(0);

  useEffect(() => { const t = setTimeout(() => setDebounced(code), 450); return () => clearTimeout(t); }, [code]);
  useEffect(() => { onError(''); }, [debounced, run]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || !e.data || e.data.__p5portal !== 1) return;
      if (e.data.type === 'error') onError(e.data.line ? `Linha ${e.data.line}: ${e.data.message}` : e.data.message);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onError]);

  const html = useMemo(() => buildRuntimeHtml(debounced, { id: 'previa', place }), [debounced, place]);
  const isNavbar = place === 'navbar';

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden border border-[var(--color-border)]"
        style={{ background: PREVIEW_BG[place], height: isNavbar ? 94 : 'min(300px, 38vh)', borderRadius: isNavbar ? 999 : 12 }}
      >
        {!isNavbar && <span className="absolute left-6 top-1/2 -translate-y-1/2 text-5xl font-black opacity-60 pointer-events-none" style={{ color: place === 'home' || place === 'projetos' ? '#0a0a0a' : '#ed86ac', transform: 'rotate(-5deg)' }}>CONTEÚDO</span>}
        <iframe
          key={`${html}-${run}`}
          ref={ref}
          title="Prévia da camada p5.js"
          sandbox="allow-scripts"
          srcDoc={html}
          className="absolute inset-0 w-full h-full border-0"
          style={{ opacity: layer.opacity, zIndex: layer.depth === 'frente' ? 3 : 1, background: 'transparent', colorScheme: 'normal' }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={small}>Teste aqui com o mouse: mover, clicar, arrastar, rolar a roda, digitar (clique antes na prévia).</span>
        <button type="button" className={btn} onClick={() => setRun((n) => n + 1)}>Reiniciar prévia</button>
      </div>
    </div>
  );
};

/* ---------- Controle de um parâmetro ---------- */
const ParamControl: React.FC<{ def: P5ParamDef; value: P5ParamValue; onChange: (v: P5ParamValue) => void }> = ({ def, value, onChange }) => {
  const id = `p5-param-${def.key}`;
  if (def.type === 'toggle') {
    return <label className="flex items-center gap-2 text-sm"><input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />{def.label}</label>;
  }
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex justify-between text-xs font-semibold text-[var(--color-text-primary)]">
        <span>{def.label}</span>{def.type === 'range' && <span className="font-mono">{String(value)}</span>}
      </label>
      {def.type === 'range' && <input id={id} type="range" className="w-full" min={def.min} max={def.max} step={def.step ?? 1} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />}
      {def.type === 'color' && (
        <div className="flex gap-2 items-center">
          <input type="color" aria-label={def.label} value={String(value)} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-[var(--color-border)] bg-transparent" />
          <input id={id} className={input} value={String(value)} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}
      {def.type === 'colors' && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            {String(value).split(',').map((c, i, all) => (
              <span key={i} className="inline-flex items-center gap-1">
                <input type="color" aria-label={`${def.label} ${i + 1}`} value={/^#[0-9a-f]{6}$/i.test(c.trim()) ? c.trim() : '#ffffff'}
                  onChange={(e) => { const next = [...all]; next[i] = e.target.value; onChange(next.join(',')); }}
                  className="h-8 w-10 rounded border border-[var(--color-border)] bg-transparent" />
                {all.length > 1 && <button type="button" aria-label={`Remover cor ${i + 1}`} className="text-xs opacity-60 cursor-pointer" onClick={() => onChange(all.filter((_, k) => k !== i).join(','))}>×</button>}
              </span>
            ))}
            <button type="button" className={btn} onClick={() => onChange(`${value},#ec83aa`)}>+ cor</button>
          </div>
          <input id={id} className={`${input} font-mono text-xs`} value={String(value)} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}
      {def.type === 'text' && <input id={id} className={input} value={String(value)} onChange={(e) => onChange(e.target.value)} />}
      {def.type === 'select' && (
        <select id={id} className={input} value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
};

/* ---------- Aba ---------- */
export const P5Manager: React.FC = () => {
  const { themeConfig, updateThemeConfig } = useTheme();
  const saved = useMemo(() => normalizeInteractions(themeConfig.interactions), [themeConfig]);
  const [draft, setDraft] = useState<InteractionsConfig>(saved);
  const [selectedId, setSelectedId] = useState<string | null>(saved.layers[0]?.id ?? null);
  const [showGallery, setShowGallery] = useState(saved.layers.length === 0);
  const [previewPlace, setPreviewPlace] = useState<P5Place>('home');
  const [codeError, setCodeError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const selected = draft.layers.find((l) => l.id === selectedId) || null;

  useEffect(() => { if (!dirty) setDraft(saved); }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (selected && !selected.places.includes(previewPlace)) setPreviewPlace(selected.places[0] || 'home'); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const beforeLeave = (e: Event) => { if (!window.confirm('Há alterações não salvas nas interações p5.js. Sair mesmo assim?')) e.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener(ADMIN_BEFORE_LEAVE_EVENT, beforeLeave);
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener(ADMIN_BEFORE_LEAVE_EVENT, beforeLeave); };
  }, [dirty]);

  const patchLayer = (patch: Partial<P5Layer>) =>
    setDraft((d) => ({ ...d, layers: d.layers.map((l) => (l.id === selectedId ? { ...l, ...patch } : l)) }));

  const addLayer = (presetId: string | null) => {
    const layer = newLayer(presetId);
    setDraft((d) => ({ ...d, layers: [...d.layers, layer] }));
    setSelectedId(layer.id);
    setShowGallery(false);
    setPreviewPlace('home');
  };

  const move = (index: number, dir: -1 | 1) => setDraft((d) => {
    const layers = [...d.layers];
    const t = index + dir;
    if (t < 0 || t >= layers.length) return d;
    [layers[index], layers[t]] = [layers[t], layers[index]];
    return { ...d, layers };
  });

  const duplicate = (layer: P5Layer) => {
    const copy = { ...layer, id: newId(), name: `${layer.name} (cópia)`, params: { ...layer.params }, places: [...layer.places] };
    setDraft((d) => ({ ...d, layers: [...d.layers, copy] }));
    setSelectedId(copy.id);
  };

  const remove = (layer: P5Layer) => {
    if (!window.confirm(`Excluir a camada "${layer.name}"? (Só será apagada de vez ao salvar.)`)) return;
    setDraft((d) => ({ ...d, layers: d.layers.filter((l) => l.id !== layer.id) }));
    setSelectedId(draft.layers.find((l) => l.id !== layer.id)?.id ?? null);
  };

  const save = async () => {
    setSaving(true); setStatus(null);
    try {
      const bad = draft.layers.find((l) => l.enabled && l.places.length === 0);
      if (bad) throw new Error(`A camada "${bad.name}" está ativa mas não tem nenhuma parte do site marcada.`);
      await updateThemeConfig({ ...themeConfig, interactions: draft }, { includeSiteContent: true });
      setStatus({ kind: 'ok', text: 'Salvo. As camadas já aparecem no site.' });
    } catch (e) {
      setStatus({ kind: 'error', text: e instanceof Error ? e.message : 'Não foi possível salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const onCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: a, selectionEnd: b, value } = el;
    patchLayer({ code: `${value.slice(0, a)}  ${value.slice(b)}` });
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = a + 2; });
  };

  const Actions = (
    <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
      <button type="button" onClick={save} disabled={!dirty || saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
        <Save className="w-4 h-4" />{saving ? 'Salvando…' : 'Salvar interações'}
      </button>
      <button type="button" className={btn} disabled={!dirty || saving} onClick={() => { setDraft(saved); setStatus(null); }}><Undo2 className="w-4 h-4" />Desfazer</button>
      <a href="#/" target="_blank" rel="noopener" className="text-xs underline text-[var(--color-text-secondary)]">Abrir site em nova aba</a>
      <span className="ml-auto text-xs" aria-live="polite">
        {status?.kind === 'error' ? <span role="alert" className="text-[var(--color-error)]">{status.text}</span>
          : dirty ? <span className="text-[var(--color-warning)]">Alterações não salvas</span>
          : status ? <span className="text-[var(--color-success)]">{status.text}</span> : null}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Interações p5.js</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Camadas interativas desenhadas com <strong>p5.js</strong> que você coloca na navbar e em qualquer página. Cada camada reage ao mouse, toque, clique, arrastar, duplo clique, roda do mouse, rolagem e teclado — sem bloquear os botões do site. Um erro no código só desliga aquela camada; o site continua no ar.
        </p>
      </div>

      {Actions}

      <section className={card}>
        <h3 className="font-bold text-[var(--color-text-primary)]">Movimento geral</h3>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={draft.animateStars} onChange={(e) => setDraft((d) => ({ ...d, animateStars: e.target.checked }))} />
          <span>Estrelas ✦ da identidade flutuando (nas páginas e na navbar)</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={draft.respectReducedMotion} onChange={(e) => setDraft((d) => ({ ...d, respectReducedMotion: e.target.checked }))} />
          <span>Desligar animações para quem ativou "reduzir movimento" no sistema
            <span className={`block ${small}`}>Recomendado: protege pessoas com labirintite, enxaqueca ou epilepsia (WCAG 2.3.3).</span></span>
        </label>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Lista de camadas */}
        <aside className={card}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[var(--color-text-primary)]">Camadas</h3>
            <button type="button" className={btn} onClick={() => setShowGallery(true)}><Plus className="w-4 h-4" />Nova</button>
          </div>
          {draft.layers.length === 0 && <p className={small}>Nenhuma camada ainda. Escolha um efeito em "Nova".</p>}
          <ul className="space-y-2">
            {draft.layers.map((layer, index) => (
              <li key={layer.id}>
                <div className={`p-2.5 rounded-[var(--radius-md)] border ${layer.id === selectedId && !showGallery ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                  <button type="button" className="w-full text-left cursor-pointer" onClick={() => { setSelectedId(layer.id); setShowGallery(false); }}>
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                      {layer.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-50" />}{layer.name}
                    </span>
                    <span className={small}>{layer.mode === 'code' ? 'Código' : getPreset(layer.preset).name} · {layer.places.map((p) => PLACES.find((x) => x.id === p)?.label).join(', ') || 'nenhum lugar'}</span>
                  </button>
                  <div className="flex gap-1 mt-2">
                    <button type="button" className={btn} aria-label="Subir" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" className={btn} aria-label="Descer" disabled={index === draft.layers.length - 1} onClick={() => move(index, 1)}><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button type="button" className={btn} aria-label="Duplicar" onClick={() => duplicate(layer)}><Copy className="w-3.5 h-3.5" /></button>
                    <button type="button" className={btn} aria-label="Excluir" onClick={() => remove(layer)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Galeria ou editor */}
        {showGallery ? (
          <section className={card}>
            <h3 className="font-bold text-[var(--color-text-primary)]">Escolha um ponto de partida</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {P5_PRESETS.map((preset) => (
                <button key={preset.id} type="button" onClick={() => addLayer(preset.id)}
                  className="text-left p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer space-y-2">
                  <span className="flex items-center gap-2 font-bold text-sm text-[var(--color-text-primary)]"><Sparkles className="w-4 h-4 text-[var(--color-primary)]" />{preset.name}</span>
                  <span className={`block ${small}`}>{preset.description}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-[var(--color-primary)]">{preset.interactions.join(' · ')}</span>
                </button>
              ))}
              <button type="button" onClick={() => addLayer(null)}
                className="text-left p-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer space-y-2">
                <span className="flex items-center gap-2 font-bold text-sm text-[var(--color-text-primary)]"><Code2 className="w-4 h-4" />Código livre</span>
                <span className={`block ${small}`}>Comece do zero escrevendo seu próprio sketch p5.js, com um modelo comentado.</span>
              </button>
            </div>
            {draft.layers.length > 0 && <button type="button" className={btn} onClick={() => setShowGallery(false)}>Cancelar</button>}
          </section>
        ) : selected ? (
          <div className="space-y-5">
            <section className={`${card} lg:sticky lg:top-[84px] z-10 shadow-xl`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-[var(--color-text-primary)]">Prévia interativa</h3>
                <label className="flex items-center gap-2 text-xs">Fundo de
                  <select className={`${input} w-auto py-1`} value={previewPlace} onChange={(e) => setPreviewPlace(e.target.value as P5Place)}>
                    {PLACES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </label>
              </div>
              <Preview layer={selected} place={previewPlace} onError={setCodeError} />
              {selected.mode === 'preset' && codeError && <p role="alert" className="text-xs text-[var(--color-error)]">⚠ {codeError}</p>}
            </section>
            <section className={card}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                <div className="space-y-1">
                  <label htmlFor="p5-name" className="text-xs font-semibold">Nome da camada</label>
                  <input id="p5-name" className={input} value={selected.name} onChange={(e) => patchLayer({ name: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={selected.enabled} onChange={(e) => patchLayer({ enabled: e.target.checked })} />Ativa no site</label>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold mb-1">Onde aparece</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {PLACES.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selected.places.includes(p.id)}
                        onChange={(e) => patchLayer({ places: e.target.checked ? [...selected.places, p.id] : selected.places.filter((x) => x !== p.id) })} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <fieldset className="space-y-1">
                  <legend className="text-xs font-semibold mb-1">Posição</legend>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="p5-depth" checked={selected.depth === 'fundo'} onChange={() => patchLayer({ depth: 'fundo' })} />Atrás do conteúdo</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="p5-depth" checked={selected.depth === 'frente'} onChange={() => patchLayer({ depth: 'frente' })} />Na frente (sem bloquear cliques)</label>
                </fieldset>
                <div className="space-y-1">
                  <label htmlFor="p5-opacity" className="flex justify-between text-xs font-semibold"><span>Opacidade</span><span className="font-mono">{Math.round(selected.opacity * 100)}%</span></label>
                  <input id="p5-opacity" type="range" min={0.05} max={1} step={0.05} value={selected.opacity} className="w-full" onChange={(e) => patchLayer({ opacity: Number(e.target.value) })} />
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.showOnMobile} onChange={(e) => patchLayer({ showOnMobile: e.target.checked })} />Mostrar no celular</label>
              </div>
            </section>

            <section className={card}>
              <div role="tablist" className="flex flex-wrap gap-2">
                <button type="button" role="tab" aria-selected={selected.mode === 'preset'} onClick={() => patchLayer({ mode: 'preset' })}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer ${selected.mode === 'preset' ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                  <Wand2 className="w-3.5 h-3.5 inline mr-1" />Efeito pronto
                </button>
                <button type="button" role="tab" aria-selected={selected.mode === 'code'}
                  onClick={() => patchLayer({ mode: 'code', code: selected.code.trim() ? selected.code : buildPresetCode(selected.preset, selected.params) })}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer ${selected.mode === 'code' ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />Código p5.js
                </button>
              </div>

              {selected.mode === 'preset' ? (
                <>
                  <div className="space-y-1">
                    <label htmlFor="p5-preset" className="text-xs font-semibold">Efeito</label>
                    <select id="p5-preset" className={input} value={selected.preset}
                      onChange={(e) => patchLayer({ preset: e.target.value, params: presetDefaults(e.target.value) })}>
                      {P5_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <p className={small}>{getPreset(selected.preset).description} <strong>Interações:</strong> {getPreset(selected.preset).interactions.join('; ')}.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {getPreset(selected.preset).params.map((def) => (
                      <ParamControl key={def.key} def={def} value={selected.params[def.key] ?? def.default}
                        onChange={(v) => patchLayer({ params: { ...selected.params, [def.key]: v } })} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btn} onClick={() => patchLayer({ params: presetDefaults(selected.preset) })}>Restaurar valores do efeito</button>
                    <button type="button" className={btn} onClick={() => patchLayer({ mode: 'code', code: buildPresetCode(selected.preset, selected.params) })}>
                      <Code2 className="w-3.5 h-3.5" />Converter em código editável
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    aria-label="Código p5.js da camada"
                    spellCheck={false}
                    className={`${input} font-mono text-xs leading-relaxed`}
                    style={{ minHeight: 360, tabSize: 2, whiteSpace: 'pre' }}
                    value={selected.code}
                    onKeyDown={onCodeKeyDown}
                    onChange={(e) => patchLayer({ code: e.target.value })}
                  />
                  {codeError
                    ? <p role="alert" className="text-xs text-[var(--color-error)] font-mono">⚠ {codeError}</p>
                    : <p className={small}>A prévia atualiza sozinha enquanto você digita. Referência: <a className="underline" href="https://p5js.org/pt-BR/reference/" target="_blank" rel="noopener noreferrer">p5js.org/reference</a>.</p>}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btn} onClick={() => { if (window.confirm('Trocar o código atual pelo modelo comentado?')) patchLayer({ code: CUSTOM_CODE_TEMPLATE }); }}>Usar modelo comentado</button>
                    <button type="button" className={btn} onClick={() => { if (window.confirm('Trocar o código pelo efeito pronto com os valores atuais?')) patchLayer({ code: buildPresetCode(selected.preset, selected.params) }); }}>Gerar a partir do efeito "{getPreset(selected.preset).name}"</button>
                  </div>
                </>
              )}
            </section>

          </div>
        ) : (
          <section className={card}><p className={small}>Selecione uma camada ou crie uma nova.</p></section>
        )}
      </div>

      {Actions}
    </div>
  );
};
