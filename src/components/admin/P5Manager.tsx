import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_P5_CONFIG } from '../../services/defaultData';
import { P5Config, ProjectBlock } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { P5Block } from '../blocks/P5Block';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';

export const P5Manager: React.FC = () => {
  const { themeConfig, updateThemeConfig } = useTheme();
  const source = {...DEFAULT_P5_CONFIG,...themeConfig.p5};
  const [config,setConfig] = useState<P5Config>(source);
  const [sample,setSample] = useState<ProjectBlock | null>(null);
  const [sampleLoading,setSampleLoading] = useState(true);
  useEffect(() => {
    let active = true;
    portfolioStore.getProjects(true).then(async projects => {
      for (const project of projects.slice(0, 15)) {
        const blocks = await portfolioStore.getProjectBlocks(project.id);
        const sketch = blocks.find(block=>block.type==='p5');
        if (sketch) { if(active) setSample(sketch); break; }
      }
    }).catch(e=>console.warn('Não foi possível carregar prévia p5.js:',e))
      .finally(()=>{if(active)setSampleLoading(false);});
    return()=>{active=false;};
  },[]);
  const dirty=JSON.stringify(config)!==JSON.stringify(source);
  const feedback=useSaveFeedback();
  useEffect(()=>{if(!dirty)setConfig(source);},[themeConfig]);
  useDirtyWarning(dirty);
  const save=()=>feedback.run(()=>updateThemeConfig({...themeConfig,p5:config}));
  return <div className="max-w-4xl space-y-6">
    <h2 className="text-2xl font-bold">Interações p5.js</h2>
    <p className="text-sm opacity-75">Este ZIP contém sketches p5.js nos blocos de projetos, não uma biblioteca de efeitos p5.js global da Home ou da Navbar. Os controles disponíveis aqui se referem exclusivamente à exibição de sketches existentes; o código de cada sketch é editado em Projetos → Blocos p5.js.</p>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setConfig(source)} error={feedback.error} success={feedback.success}/>
    <section className={cardClass}>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/> Exibir sketches dos projetos</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={config.pointerEnabled} onChange={e=>setConfig({...config,pointerEnabled:e.target.checked})}/> Permitir interação com o mouse e toque nos sketches</label>
      <label className={fieldClass}><span>Altura do quadro (px)</span><input type="range" min="180" max="900" step="10" value={config.heightPx} onChange={e=>setConfig({...config,heightPx:Number(e.target.value)})}/><input type="number" min="180" max="900" className={inputClass} value={config.heightPx} onChange={e=>setConfig({...config,heightPx:Math.min(900,Math.max(180,Number(e.target.value)))})}/></label>
    </section>
    <section className={cardClass}><h3 className="font-bold">Prévia de um sketch já cadastrado</h3>
      {sampleLoading ? <p className="text-sm">Procurando sketches existentes…</p> : sample ?
        (config.enabled ? <P5Block block={sample} previewConfig={config} /> : <p className="text-sm">Sketch desativado na prévia.</p>) :
        <p className="text-sm opacity-75">Nenhum sketch p5.js localizado entre os primeiros 15 projetos cadastrados. Adicione um bloco p5.js a um projeto para obter uma prévia real.</p>}
    </section>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setConfig(source)} error={feedback.error} success={feedback.success}/>
  </div>;
};
