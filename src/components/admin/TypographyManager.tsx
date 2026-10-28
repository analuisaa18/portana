import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeTypography } from '../../types/portfolio';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';

type Font = { family: string; variants: string[] };
const fontRoles: Array<{key:keyof ThemeTypography; label:string}> = [
  { key:'fontFamilyHeadings',label:'Títulos' },{ key:'fontFamilyBody',label:'Textos corridos' },
  { key:'fontFamilyNav',label:'Navbar' }, {key:'fontFamilyButtons',label:'Botões'},
  {key:'fontFamilyProjects',label:'Projetos'},
];
const allowedWeights = [100,200,300,400,500,600,700,800,900];

export const TypographyManager: React.FC = () => {
  const { themeConfig, updateThemeConfig } = useTheme();
  const source = themeConfig.typography;
  const [typography, setTypography] = useState<ThemeTypography>(source);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [search, setSearch] = useState('');
  const [chosenRole, setChosenRole] = useState<keyof ThemeTypography>('fontFamilyHeadings');
  const [sourceInfo, setSourceInfo] = useState('Consultando Google Fonts…');
  const [previewFont, setPreviewFont] = useState('');
  const dirty = JSON.stringify(typography) !== JSON.stringify(source);
  const feedback = useSaveFeedback();
  useEffect(() => {if(!dirty) setTypography(source);},[themeConfig]);
  useDirtyWarning(dirty);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetch('/api/google-fonts');
        if (!result.ok) throw new Error('API oficial não configurada');
        const data = await result.json();
        if (mounted && Array.isArray(data.items)) {setFonts(data.items);setSourceInfo('Catálogo oficial Google Fonts API');return;}
      } catch {}
      try {
        const result = await fetch('https://cdn.jsdelivr.net/gh/fontsource/google-font-metadata@main/data/google-fonts-v1.json');
        if (!result.ok) throw new Error('Catálogo offline');
        const raw = await result.json();
        const items: any[] = Array.isArray(raw) ? raw : (raw.familyMetadataList || raw.items || Object.values(raw));
        if (mounted && Array.isArray(items)) {
          setFonts(items.map(i => ({family:typeof i === 'string' ? i : i.family || i.name,variants:i?.variants || ['regular','700']})).filter((i: Font)=>Boolean(i.family)));
          setSourceInfo('Catálogo de contingência (mirror); configure GOOGLE_FONTS_API_KEY para a API oficial.');return;
        }
      } catch {}
      if(mounted)setSourceInfo('Catálogo indisponível. As fontes atuais permanecem disponíveis.');
    };
    load();return()=>{mounted=false;};
  },[]);
  const visibleFonts = useMemo(() => fonts.filter(f=>f.family.toLowerCase().includes(search.toLowerCase())).slice(0,32),[fonts,search]);
  const familyPreview = String(typography[chosenRole] || typography.fontFamilyBody).split(',')[0].trim();
  useEffect(() => {
    if (!familyPreview) return;
    const el = document.createElement('link');el.rel='stylesheet';
    el.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyPreview).replace(/%20/g,'+')}:wght@400;700&display=swap`;
    document.head.appendChild(el);return()=>{el.remove();};
  },[familyPreview]);
  useEffect(() => {
    if (!previewFont) return;
    const el = document.createElement('link');el.rel='stylesheet';
    el.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(previewFont).replace(/%20/g,'+')}&display=swap`;
    document.head.appendChild(el);return()=>el.remove();
  },[previewFont]);
  const save = () => feedback.run(() => updateThemeConfig({ ...themeConfig, typography }));
  const update = (patch: Partial<ThemeTypography>)=>setTypography(prev=>({...prev,...patch}));
  return <div className="max-w-5xl space-y-6">
    <div><h2 className="text-2xl font-bold">Tipografia — Google Fonts</h2><p className="text-sm opacity-75 mt-2">Pesquise, selecione famílias, pesos e dimensões. Fontes atuais permanecem até você salvar.</p><p className="text-xs mt-2 opacity-75" role="status">{sourceInfo}</p></div>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setTypography(source)} error={feedback.error} success={feedback.success}/>
    <section className={cardClass}><h3 className="font-bold">Aplicar família tipográfica</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{fontRoles.map(role=><label key={role.key} className={fieldClass}><span>{role.label}</span><input className={inputClass} value={String(typography[role.key] || '')} onFocus={()=>setChosenRole(role.key)} onChange={e=>update({[role.key]:e.target.value})}/></label>)}</div>
      <label className={fieldClass}><span>Selecionar destino</span><select className={inputClass} value={chosenRole} onChange={e=>setChosenRole(e.target.value as keyof ThemeTypography)}>{fontRoles.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}</select></label>
      <label className={fieldClass}><span>Pesquisar fontes disponíveis</span><input className={inputClass} placeholder="Pesquisar fonte…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">{visibleFonts.map(f=><button key={f.family} type="button" onMouseEnter={()=>setPreviewFont(f.family)} onFocus={()=>setPreviewFont(f.family)} onClick={()=>{
          const avail = (f.variants || []).map(v=>v==='regular'?400:/^\d+$/.test(v)?Number(v):NaN).filter(v=>Number.isFinite(v));
          update({[chosenRole]:`'${f.family}', sans-serif`,
            availableWeightsByFamily:{...typography.availableWeightsByFamily,[f.family]:avail.length?avail:[400]}});
        }} className="text-left p-3 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)]"><strong className="block text-sm">{f.family}</strong><span className="text-xs opacity-80" style={{fontFamily:previewFont===f.family ? `'${f.family}', sans-serif` : 'inherit'}}>Ana Bochenek — Portfólio Autoral</span><span className="block text-[10px] opacity-60">{f.variants?.slice(0,8).join(', ')}</span></button>)}</div>
      {visibleFonts.length===0 && <p className="text-xs opacity-75">Nenhuma fonte correspondente no catálogo disponível.</p>}
    </section>
    <section className={cardClass}><h3 className="font-bold">Pesos carregados</h3><p className="text-xs opacity-70">Somente os pesos selecionados serão solicitados ao Google Fonts.</p>
      <div className="flex flex-wrap gap-4">{allowedWeights.map(w=><label key={w} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(typography.selectedWeights || [400,700]).includes(w)} onChange={e=>update({selectedWeights:e.target.checked?[...new Set([...(typography.selectedWeights || [400,700]),w])].sort((a,b)=>a-b):(typography.selectedWeights || [400,700]).filter(a=>a!==w)})}/>{w}</label>)}</div>
    </section>
    <section className={cardClass}><h3 className="font-bold">Hierarquia tipográfica</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([
        ['baseSizePx','Tamanho base (px)',12,25,.5],['scaleRatio','Escala',1.1,1.6,.01],['headingWeight','Peso dos títulos',100,900,100],['bodyWeight','Peso dos textos',100,900,100],['lineHeight','Entrelinha do corpo',1,2.5,.05],['headingLineHeight','Entrelinha de títulos',.8,1.8,.05],['letterSpacing','Entreletras (em)',-.1,.15,.005],['navWeight','Peso Navbar',100,900,100],['buttonsWeight','Peso botões',100,900,100],['projectsWeight','Peso projetos',100,900,100]
      ] as Array<[keyof ThemeTypography,string,number,number,number]>).map(([key,label,min,max,step])=><label key={key} className={fieldClass}><span>{label}</span><input type="number" min={min} max={max} step={step} className={inputClass} value={Number(typography[key] ?? (key==='navWeight' ? 900 : 800))} onChange={e=>update({[key]:Number(e.target.value)})}/></label>)}</div>
    </section>
    <section className={cardClass}><h3 className="font-bold">Prévia da seleção — {chosenRole}</h3><div className="p-5 border rounded break-words" style={{fontFamily:String(typography[chosenRole] || typography.fontFamilyHeadings),fontWeight:typography.headingWeight,lineHeight:typography.headingLineHeight}}><p className="text-2xl">Design, tipografia e experiências visuais.</p><p className="text-sm">A forma e o conteúdo dialogam.</p></div></section>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setTypography(source)} error={feedback.error} success={feedback.success}/>
  </div>;
};
