import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_SITE_CONTACT } from '../../services/defaultData';
import { SocialLink } from '../../types/portfolio';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

export const ContactManager: React.FC = () => {
  const { settings, themeConfig, updateSettings } = useTheme();
  const source = { whatsapp:settings.whatsapp, email_public:settings.email_public, location:settings.location,
    social_links:Array.isArray(settings.social_links) ? settings.social_links : [], contact:{...DEFAULT_SITE_CONTACT,...themeConfig.contact} };
  const [data,setData]=useState(source);
  const dirty=JSON.stringify(data)!==JSON.stringify(source);
  const feedback=useSaveFeedback();
  useEffect(()=>{if(!dirty)setData(source);},[settings,themeConfig]);
  useDirtyWarning(dirty);
  const save=()=>feedback.run(async()=>{
    if(data.contact.whatsappEnabled && data.whatsapp && !/^\d{10,15}$/.test(data.whatsapp.replace(/\D/g,''))) throw new Error('Número de WhatsApp deve ter DDI + DDD + número, entre 10 e 15 dígitos.');
    await updateSettings({
      whatsapp:data.whatsapp,email_public:data.email_public,location:data.location,
      social_links:data.social_links,theme_config:{...themeConfig,contact:data.contact},
    });
  });
  const changeLink=(idx:number,patch:Partial<SocialLink>)=>setData({...data,social_links:data.social_links.map((link,i)=>i===idx?{...link,...patch}:link)});
  const move=(idx:number,amount:number)=>{const next=idx+amount;if(next<0||next>=data.social_links.length)return;const links=[...data.social_links];[links[next],links[idx]]=[links[idx],links[next]];setData({...data,social_links:links});};
  const exampleText=encodeURIComponent(data.contact.whatsappMessage);
  const waUrl=`https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=${exampleText}`;
  return <div className="max-w-5xl space-y-6">
    <h2 className="text-2xl font-bold">Contato e redes sociais</h2>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setData(source)} error={feedback.error} success={feedback.success}/>
    <section className={cardClass}><h3 className="font-bold">WhatsApp</h3>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={data.contact.whatsappEnabled} onChange={e=>setData({...data,contact:{...data.contact,whatsappEnabled:e.target.checked}})}/> Ativar WhatsApp no site</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className={fieldClass}><span>Número com código do país</span><input className={inputClass} inputMode="tel" value={data.whatsapp} onChange={e=>setData({...data,whatsapp:e.target.value})} placeholder="55DDDXXXXXXXXX"/></label>
        <label className={fieldClass}><span>Texto do botão</span><input className={inputClass} value={data.contact.whatsappButtonText} onChange={e=>setData({...data,contact:{...data.contact,whatsappButtonText:e.target.value}})}/></label>
      </div>
      <label className={fieldClass}><span>Mensagem inicial automática</span><textarea className={inputClass} rows={3} value={data.contact.whatsappMessage} onChange={e=>setData({...data,contact:{...data.contact,whatsappMessage:e.target.value}})}/></label>
      <p className="text-xs opacity-80 break-all">Prévia do link: {waUrl}</p>
      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 border border-[var(--color-border)] rounded text-sm">Testar conversa</a>
    </section>
    <section className={cardClass}><h3 className="font-bold">Informações de contato</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{([['email_public','E-mail público'],['location','Localização']] as const).map(([key,label])=><label key={key} className={fieldClass}><span>{label}</span><input className={inputClass} value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}</div>
    </section>
    <section className={cardClass}><h3 className="font-bold">Links já cadastrados</h3>
      {data.social_links.map((link,i)=><div key={link.id} className="border-b border-[var(--color-border)] pb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><label className={fieldClass}><span>Rede / plataforma</span><input className={inputClass} value={link.platform} onChange={e=>changeLink(i,{platform:e.target.value})}/></label>
          <label className={fieldClass}><span>Texto do link</span><input className={inputClass} value={link.display_label || link.platform} onChange={e=>changeLink(i,{display_label:e.target.value})}/></label>
          <label className={fieldClass}><span>URL</span><input className={inputClass} value={link.url} onChange={e=>changeLink(i,{url:e.target.value})}/></label>
        </div>
        <div className="flex items-center gap-4"><label className="text-sm flex items-center gap-2"><input type="checkbox" checked={link.enabled!==false} onChange={e=>changeLink(i,{enabled:e.target.checked})}/> Visível</label>
          <button type="button" aria-label="Subir" disabled={!i} onClick={()=>move(i,-1)}><ArrowUp size={17}/></button><button type="button" aria-label="Descer" disabled={i===data.social_links.length-1} onClick={()=>move(i,1)}><ArrowDown size={17}/></button>
          <button type="button" className="text-sm flex gap-1 items-center" onClick={()=>{if(window.confirm('Excluir este link?'))setData({...data,social_links:data.social_links.filter((_,idx)=>idx!==i)})}}><Trash2 size={16}/> Remover</button>
        </div>
      </div>)}
      <button type="button" className="p-2 border rounded text-sm" onClick={()=>setData({...data,social_links:[...data.social_links,{id:crypto.randomUUID(),platform:'Outro',url:'',label:'Novo link',enabled:true}]})}>+ Adicionar link</button>
    </section>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={()=>setData(source)} error={feedback.error} success={feedback.success}/>
  </div>;
};
