import React, { useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { DesignConfig, FontGroupStyle, TextTransform } from '../../types/design';
import { ensureGoogleFont, GoogleFontMeta, loadGoogleFontsCatalog, safeFamily } from '../../lib/googleFonts';

/* ---------- Acesso por caminho ("navbar.heightPx") ao DesignConfig, sempre imutável ---------- */

export const getPath = (obj: any, path: string): any =>
  path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

/** Define (ou remove, se value === undefined) o valor no caminho, limpando objetos que ficarem vazios. */
export const setPath = <T extends object>(obj: T, path: string, value: unknown): T => {
  const keys = path.split('.');
  const walk = (node: any, i: number): any => {
    const copy = { ...(node || {}) };
    if (i === keys.length - 1) {
      if (value === undefined) delete copy[keys[i]]; else copy[keys[i]] = value;
    } else {
      const child = walk(copy[keys[i]], i + 1);
      if (child && Object.keys(child).length) copy[keys[i]] = child; else delete copy[keys[i]];
    }
    return copy;
  };
  return walk(obj, 0) as T;
};

export const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.keys(v).sort().reduce((acc: any, k) => { acc[k] = v[k]; return acc; }, {})
      : v);

/* ---------- Definição declarativa de campos ---------- */

export type FieldDef =
  | { kind: 'color'; path: string; label: string; affects: string; def: string }
  | { kind: 'number'; path: string; label: string; affects: string; def: number; min: number; max: number; step?: number; unit?: string }
  | { kind: 'select'; path: string; label: string; affects: string; options: Array<{ value: string; label: string }>; def: string }
  | { kind: 'toggle'; path: string; label: string; affects: string };

export interface ControlsProps { design: DesignConfig; onChange: (path: string, value: unknown) => void }

const labelCls = 'text-xs font-bold text-[var(--color-text-primary)]';
const hintCls = 'text-[11px] text-[var(--color-text-secondary)] leading-snug';
const inputCls = 'px-2 py-1.5 text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]';

const ResetBtn: React.FC<{ show: boolean; onClick: () => void }> = ({ show, onClick }) => (
  <button
    type="button" onClick={onClick} disabled={!show} title="Voltar ao valor original do site"
    className={`p-1 rounded ${show ? 'text-[var(--color-accent)] hover:bg-black/10' : 'opacity-20 cursor-default'}`}
    aria-label="Restaurar valor original"
  ><RotateCcw className="w-3.5 h-3.5" /></button>
);

const normalizeHex = (v: string) => {
  const t = v.trim();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(t) ? t : null;
};
const toSixHex = (hex: string) => (hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex);

export const ColorControl: React.FC<{ def: Extract<FieldDef, { kind: 'color' }> } & ControlsProps> = ({ def, design, onChange }) => {
  const value = getPath(design, def.path) as string | undefined;
  const [text, setText] = useState(value ?? '');
  useEffect(() => setText(value ?? ''), [value]);
  const shown = value ?? def.def;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className={labelCls}>{def.label}</label>
        <ResetBtn show={value !== undefined} onClick={() => onChange(def.path, undefined)} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color" value={toSixHex(normalizeHex(shown) || '#000000')} aria-label={`${def.label} — seletor`}
          onChange={(e) => onChange(def.path, e.target.value)}
          className="w-10 h-8 p-0 border border-[var(--color-border)] rounded cursor-pointer bg-transparent"
        />
        <input
          type="text" value={text} placeholder={`${def.def} (padrão)`} spellCheck={false} aria-label={`${def.label} — código HEX`}
          onChange={(e) => {
            setText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(def.path, hex);
            if (e.target.value.trim() === '') onChange(def.path, undefined);
          }}
          className={`${inputCls} w-28 font-mono`}
        />
        {value === undefined && <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">padrão</span>}
      </div>
      <p className={hintCls}>Afeta: {def.affects}</p>
    </div>
  );
};

export const NumberControl: React.FC<{ def: Extract<FieldDef, { kind: 'number' }> } & ControlsProps> = ({ def, design, onChange }) => {
  const value = getPath(design, def.path) as number | undefined;
  const shown = value ?? def.def;
  const step = def.step ?? 1;
  const set = (raw: string) => {
    if (raw === '') return onChange(def.path, undefined);
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(def.path, Math.min(def.max, Math.max(def.min, n)));
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className={labelCls}>{def.label}</label>
        <ResetBtn show={value !== undefined} onClick={() => onChange(def.path, undefined)} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range" min={def.min} max={def.max} step={step} value={shown} aria-label={`${def.label} — controle deslizante`}
          onChange={(e) => set(e.target.value)} className="flex-1 accent-[var(--color-accent)]"
        />
        <input
          type="number" min={def.min} max={def.max} step={step} value={value ?? ''} placeholder={String(def.def)}
          aria-label={`${def.label} — valor`} onChange={(e) => set(e.target.value)} className={`${inputCls} w-20`}
        />
        <span className="text-[10px] text-[var(--color-text-secondary)] w-6">{def.unit ?? ''}</span>
      </div>
      <p className={hintCls}>Afeta: {def.affects}{value === undefined ? ' · usando o valor original' : ''}</p>
    </div>
  );
};

export const SelectControl: React.FC<{ def: Extract<FieldDef, { kind: 'select' }> } & ControlsProps> = ({ def, design, onChange }) => {
  const value = getPath(design, def.path) as string | undefined;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className={labelCls}>{def.label}</label>
        <ResetBtn show={value !== undefined} onClick={() => onChange(def.path, undefined)} />
      </div>
      <select
        value={value ?? ''} aria-label={def.label} className={`${inputCls} w-full`}
        onChange={(e) => onChange(def.path, e.target.value === '' ? undefined : e.target.value)}
      >
        <option value="">Original do site</option>
        {def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <p className={hintCls}>Afeta: {def.affects}</p>
    </div>
  );
};

export const ToggleControl: React.FC<{ def: Extract<FieldDef, { kind: 'toggle' }> } & ControlsProps> = ({ def, design, onChange }) => {
  const value = getPath(design, def.path) as boolean | undefined;
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(def.path, e.target.checked ? true : undefined)} className="accent-[var(--color-accent)]" />
        <span className={labelCls}>{def.label}</span>
      </label>
      <p className={hintCls}>Afeta: {def.affects}</p>
    </div>
  );
};

export const Field: React.FC<{ def: FieldDef } & ControlsProps> = ({ def, ...rest }) => {
  switch (def.kind) {
    case 'color': return <ColorControl def={def} {...rest} />;
    case 'number': return <NumberControl def={def} {...rest} />;
    case 'select': return <SelectControl def={def} {...rest} />;
    case 'toggle': return <ToggleControl def={def} {...rest} />;
  }
};

export const FieldGrid: React.FC<{ title?: string; description?: string; fields: FieldDef[] } & ControlsProps> = ({ title, description, fields, ...rest }) => (
  <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface)] space-y-4">
    {title && <header><h3 className="text-sm font-black text-[var(--color-text-primary)]">{title}</h3>{description && <p className={`${hintCls} mt-0.5`}>{description}</p>}</header>}
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {fields.map((f) => <Field key={f.path} def={f} {...rest} />)}
    </div>
  </section>
);

/* ---------- Catálogo do Google Fonts (mesma integração já usada no projeto) ---------- */

export const useFontCatalog = () => {
  const [fonts, setFonts] = useState<GoogleFontMeta[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const load = () => {
    setState('loading');
    loadGoogleFontsCatalog().then((list) => { setFonts(list); setState('ready'); })
      .catch((e) => { setError(e instanceof Error ? e.message : String(e)); setState('error'); });
  };
  useEffect(load, []);
  return { fonts, state, error, retry: load };
};

const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const STD_WEIGHTS = [300, 400, 500, 600, 700, 800, 900];

export const FontPicker: React.FC<{
  value?: string;
  catalog: ReturnType<typeof useFontCatalog>;
  onPick: (meta: GoogleFontMeta | null) => void;
  label: string;
}> = ({ value, catalog, onPick, label }) => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(40);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? catalog.fonts.filter((f) => f.family.toLowerCase().includes(q)) : catalog.fonts;
  }, [catalog.fonts, query]);
  useEffect(() => setLimit(40), [query]);
  useEffect(() => { if (value) ensureGoogleFont(value, [400, 700]); }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={labelCls}>Fonte — {label}</span>
        <ResetBtn show={Boolean(value)} onClick={() => onPick(null)} />
      </div>
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-[var(--color-text-secondary)]" />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Buscar fonte — ${label}`}
          placeholder={catalog.state === 'ready' ? `Buscar entre ${catalog.fonts.length} fontes do Google Fonts…` : 'Carregando catálogo…'}
          className={`${inputCls} w-full pl-7`}
        />
      </div>
      {value && (
        <p className="text-base text-[var(--color-text-primary)] px-2 py-1.5 border border-dashed border-[var(--color-border)] rounded" style={{ fontFamily: `"${safeFamily(value)}", sans-serif` }}>
          {value} — Aa Bb Cc 123 · Portfólio de design
        </p>
      )}
      {catalog.state === 'error' && (
        <p className="text-xs text-[var(--color-error)]">
          Não foi possível carregar o catálogo ({catalog.error}).{' '}
          <button type="button" className="underline" onClick={catalog.retry}>Tentar de novo</button>
        </p>
      )}
      <ul className="max-h-44 overflow-auto border border-[var(--color-border)] rounded-[var(--radius-sm)] divide-y divide-[var(--color-border)]" role="listbox" aria-label={`Fontes — ${label}`}>
        {filtered.slice(0, limit).map((f) => (
          <li key={f.family} role="option" aria-selected={f.family === value}>
            <button
              type="button" onClick={() => onPick(f)}
              onMouseEnter={() => ensureGoogleFont(f.family, [400])} onFocus={() => ensureGoogleFont(f.family, [400])}
              className={`w-full text-left px-2 py-1.5 text-sm hover:bg-black/10 ${f.family === value ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-primary)]'}`}
              style={{ fontFamily: `"${safeFamily(f.family)}", sans-serif` }}
            >{f.family}</button>
          </li>
        ))}
        {catalog.state === 'ready' && filtered.length === 0 && <li className="px-2 py-2 text-xs text-[var(--color-text-secondary)]">Nenhuma fonte encontrada.</li>}
      </ul>
      {filtered.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + 60)} className="text-xs underline text-[var(--color-accent)]">
          Mostrar mais ({filtered.length - limit} restantes)
        </button>
      )}
    </div>
  );
};

/* ---------- Cartão de um grupo tipográfico (cada grupo é 100% independente) ---------- */

export const FontGroupCard: React.FC<{
  id: string; title: string; affects: string; sample: string; group: 'main' | 'headings' | 'subheadings' | 'body' | 'buttons' | 'navbar' | 'highlight';
  design: DesignConfig; catalog: ReturnType<typeof useFontCatalog>;
  defaults: { sizePx: number; weight: number; lineHeight: number; letterSpacingEm: number };
  onChange: (path: string, value: unknown) => void;
  hideSize?: boolean;
}> = ({ title, affects, sample, group, design, catalog, defaults, onChange, hideSize }) => {
  const f: FontGroupStyle = design.fonts[group] || {};
  const p = (k: keyof FontGroupStyle) => `fonts.${group}.${k}`;
  const weights = f.availableWeights?.length ? f.availableWeights : (f.family ? ALL_WEIGHTS : STD_WEIGHTS);
  const pick = (meta: GoogleFontMeta | null) => {
    if (!meta) {
      onChange(p('family'), undefined); onChange(p('availableWeights'), undefined); onChange(p('hasItalic'), undefined);
      return;
    }
    onChange(p('family'), meta.family);
    onChange(p('availableWeights'), meta.weights);
    onChange(p('hasItalic'), meta.hasItalic);
    if (f.weight && !meta.weights.includes(f.weight)) {
      // mantém o peso mais próximo que a nova fonte realmente possui
      const nearest = meta.weights.reduce((a, b) => (Math.abs(b - f.weight!) < Math.abs(a - f.weight!) ? b : a));
      onChange(p('weight'), nearest);
    }
    if (f.italic && !meta.hasItalic) onChange(p('italic'), undefined);
  };
  const num = (key: string, label: string, def: number, min: number, max: number, step: number, unit: string, aff: string): FieldDef =>
    ({ kind: 'number', path: `fonts.${group}.${key}`, label, def, min, max, step, unit, affects: aff });

  return (
    <section className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 bg-[var(--color-surface)] space-y-4">
      <header>
        <h3 className="text-sm font-black text-[var(--color-text-primary)]">{title}</h3>
        <p className={`${hintCls} mt-0.5`}>Afeta: {affects}. Independente dos demais grupos.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <FontPicker value={f.family} catalog={catalog} onPick={pick} label={title} />
        <div className="space-y-3">
          <div className="space-y-1">
            <span className={labelCls}>Grossura (somente pesos que a fonte possui)</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Peso — ${title}`}>
              {weights.map((w) => (
                <button
                  key={w} type="button" aria-pressed={f.weight === w} onClick={() => onChange(p('weight'), f.weight === w ? undefined : w)}
                  className={`px-2.5 py-1 text-xs rounded border ${f.weight === w ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'}`}
                >{w}</button>
              ))}
            </div>
            <p className={hintCls}>{f.weight ? `Peso ${f.weight} aplicado.` : `Sem peso definido — usa o original do site (padrão ${defaults.weight}).`}</p>
          </div>
          <div className="flex gap-4 flex-wrap items-end">
            <ToggleItalic f={f} onChange={(v) => onChange(p('italic'), v)} />
            <div className="space-y-1">
              <span className={labelCls}>Transformação do texto</span>
              <select
                value={f.transform ?? ''} aria-label={`Transformação — ${title}`} className={`${inputCls} block`}
                onChange={(e) => onChange(p('transform'), (e.target.value || undefined) as TextTransform | undefined)}
              >
                <option value="">Original do site</option>
                <option value="none">Normal</option><option value="uppercase">MAIÚSCULAS</option>
                <option value="lowercase">minúsculas</option><option value="capitalize">Capitalizar Palavras</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {!hideSize && <Field def={num('sizePx', 'Tamanho (desktop)', defaults.sizePx, 8, 200, 1, 'px', affects)} design={design} onChange={onChange} />}
        {!hideSize && <Field def={num('sizeMobilePx', 'Tamanho (celular)', Math.max(8, Math.round(defaults.sizePx * 0.8)), 8, 160, 1, 'px', `${affects} (≤ 767px)`)} design={design} onChange={onChange} />}
        <Field def={num('lineHeight', 'Altura da linha', defaults.lineHeight, 0.7, 3, 0.05, '', affects)} design={design} onChange={onChange} />
        <Field def={num('letterSpacingEm', 'Espaço entre letras', defaults.letterSpacingEm, -0.2, 0.6, 0.005, 'em', affects)} design={design} onChange={onChange} />
      </div>
      <p className="text-lg text-[var(--color-text-primary)] truncate" style={{
        fontFamily: f.family ? `"${safeFamily(f.family)}", sans-serif` : undefined,
        fontWeight: f.weight, fontStyle: f.italic ? 'italic' : undefined, lineHeight: f.lineHeight,
        letterSpacing: f.letterSpacingEm !== undefined ? `${f.letterSpacingEm}em` : undefined, textTransform: f.transform,
      }}>{sample}</p>
    </section>
  );
};

const ToggleItalic: React.FC<{ f: FontGroupStyle; onChange: (v: boolean | undefined) => void }> = ({ f, onChange }) => {
  const disabled = f.family !== undefined && f.hasItalic === false;
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`} title={disabled ? 'Esta fonte não possui itálico' : ''}>
      <input type="checkbox" disabled={disabled} checked={Boolean(f.italic)} onChange={(e) => onChange(e.target.checked ? true : undefined)} className="accent-[var(--color-accent)]" />
      <span className={labelCls}>Itálico</span>
    </label>
  );
};
