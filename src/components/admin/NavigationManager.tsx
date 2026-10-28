import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_NAVIGATION } from '../../services/defaultData';
import { NavigationConfig } from '../../types/portfolio';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';
import { ArrowDown, ArrowUp } from 'lucide-react';
const controls: Array<{ key: keyof Omit<NavigationConfig,'links'>; label: string; min: number; max: number }> = [
  { key:'heightDesktopPx',label:'Altura da Navbar — desktop',min:56,max:150 },
  { key:'heightMobilePx',label:'Altura da Navbar — mobile',min:56,max:130 },
  { key:'brandSizeDesktopPx',label:'Nome da marca — desktop (px)',min:10,max:36 },
  { key:'brandSizeMobilePx',label:'Nome da marca — mobile (px)',min:10,max:24 },
  { key:'navSizeDesktopPx',label:'Links — desktop (px)',min:8,max:22 },
  { key:'navSizeMobilePx',label:'Links — mobile (px)',min:7,max:16 },
  { key:'gapDesktopPx',label:'Distância entre links — desktop',min:5,max:60 },
  { key:'gapMobilePx',label:'Distância entre links — mobile',min:3,max:30 },
];
export const NavigationManager: React.FC = () => {
  const { themeConfig, settings, updateThemeConfig } = useTheme();
  const source = { ...DEFAULT_NAVIGATION, ...themeConfig.navigation };
  const [nav, setNav] = useState<NavigationConfig>(source);
  const [previewMobile, setPreviewMobile] = useState(false);
  const dirty = JSON.stringify(nav) !== JSON.stringify(source);
  const feedback = useSaveFeedback();
  useEffect(() => { if (!dirty) setNav(source); }, [themeConfig]);
  useDirtyWarning(dirty);
  const move = (idx: number, direction: -1|1) => {
    const target = idx + direction;if (target < 0 || target >= nav.links.length) return;
    const links = [...nav.links];[links[idx],links[target]] = [links[target],links[idx]];setNav({...nav,links});
  };
  const save = () => feedback.run(() => updateThemeConfig({ ...themeConfig, navigation:nav }));
  return <div className="max-w-5xl space-y-6">
    <h2 className="text-2xl font-bold">Navbar e navegação</h2><p className="text-sm opacity-75">O formato, as cores e a estética do header permanecem intactos. Os parâmetros aparecem imediatamente na prévia abaixo, antes de salvar.</p>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={() => setNav(source)} error={feedback.error} success={feedback.success}/>
    <section className={cardClass}>
      <h3 className="font-bold">Pré-visualização</h3>
      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={previewMobile} onChange={e => setPreviewMobile(e.target.checked)}/> Simular celular</label>
      <div className="overflow-auto bg-[#e588aa] p-3 sm:p-5 rounded">
        <div className="mx-auto bg-[#050505] border border-[#f08bb0] text-white rounded-full flex items-center justify-between p-3" style={{height:previewMobile?nav.heightMobilePx:nav.heightDesktopPx,maxWidth:previewMobile?390:'100%',gap:8}}>
          <strong style={{fontSize:previewMobile?nav.brandSizeMobilePx:nav.brandSizeDesktopPx,overflowWrap:'anywhere'}}>✦ {settings.portfolio_name}</strong>
          <div className="flex items-center flex-wrap justify-end" style={{gap:previewMobile?nav.gapMobilePx:nav.gapDesktopPx}}>{nav.links.filter(i=>i.visible).map(i=><span key={i.id} style={{fontSize:previewMobile?nav.navSizeMobilePx:nav.navSizeDesktopPx,textTransform:'uppercase',fontWeight:900}}>{i.label}</span>)}</div>
        </div>
      </div>
    </section>
    <section className={cardClass}><h3 className="font-bold">Links do menu</h3>
      {nav.links.map((link,index)=><div key={link.id} className="flex flex-wrap gap-3 items-center border-b border-[var(--color-border)] pb-3">
        <label className="flex-1 min-w-32 text-xs">{link.id}<input className={inputClass} value={link.label} onChange={e=>setNav({...nav,links:nav.links.map(i=>i.id===link.id?{...i,label:e.target.value}:i)})}/></label>
        <label className="text-sm flex gap-1 items-center"><input type="checkbox" checked={link.visible} onChange={e=>setNav({...nav,links:nav.links.map(i=>i.id===link.id?{...i,visible:e.target.checked}:i)})}/> Visível</label>
        <button type="button" aria-label="Subir link" disabled={!index} onClick={()=>move(index,-1)}><ArrowUp size={18}/></button><button type="button" aria-label="Descer link" disabled={index===nav.links.length-1} onClick={()=>move(index,1)}><ArrowDown size={18}/></button>
      </div>)}
    </section>
    <section className={cardClass}><h3 className="font-bold">Dimensões e espaçamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{controls.map(c=><label key={c.key} className={fieldClass}><span>{c.label}: {nav[c.key]} px</span><input className="w-full accent-[var(--color-accent)]" type="range" min={c.min} max={c.max} value={nav[c.key]} onChange={e=>setNav({...nav,[c.key]:Number(e.target.value)})}/><input className={inputClass} type="number" min={c.min} max={c.max} value={nav[c.key]} onChange={e=>setNav({...nav,[c.key]:Math.max(c.min,Math.min(c.max,Number(e.target.value)))})}/></label>)}</div>
    </section>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={() => setNav(source)} error={feedback.error} success={feedback.success}/>
  </div>;
};
