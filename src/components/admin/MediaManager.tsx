import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { portfolioStore } from '../../services/store';
import { DEFAULT_SITE_MEDIA } from '../../services/defaultData';
import { SiteMedia } from '../../types/portfolio';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';
import desktop from '../../assets/identity/colagem-desktop.png';
import mobile from '../../assets/identity/colagem-mobile.png';
import rosa from '../../assets/identity/fundo-02-rosa-desktop.png';
import rosaMobile from '../../assets/identity/fundo-02-rosa-mobile.png';
import preto from '../../assets/identity/fundo-02-preto-desktop.png';

const mediaFields: Array<{ key: keyof SiteMedia; section: string; title: string; fallback: string }> = [
  { key:'homeCollageDesktop', section:'HOME', title:'Colagem principal (desktop)', fallback: desktop },
  { key:'homeCollageMobile', section:'HOME', title:'Colagem principal (mobile)', fallback: mobile },
  { key:'homeBackground', section:'HOME', title:'Fundo desktop – camada superior', fallback: rosa },
  { key:'homeBackgroundMobile', section:'HOME', title:'Fundo mobile – camada superior', fallback: rosaMobile },
  { key:'projectsBackground', section:'PROJETOS', title:'Fundo dos projetos', fallback: rosa },
  { key:'aboutBackground', section:'SOBRE', title:'Fundo da página Sobre', fallback: preto },
  { key:'contactBackground', section:'CONTATO', title:'Fundo da página Contato', fallback: preto },
];

export const MediaManager: React.FC = () => {
  const { themeConfig, settings, updateThemeConfig, updateSettings } = useTheme();
  const source = { ...DEFAULT_SITE_MEDIA, ...themeConfig.media };
  const [media, setMedia] = useState<SiteMedia>(source);
  const [profile, setProfile] = useState(settings.profile_image || '');
  const [uploading, setUploading] = useState('');
  const [uploadError, setUploadError] = useState('');
  const dirty = JSON.stringify(media) !== JSON.stringify(source) || profile !== (settings.profile_image || '');
  const feedback = useSaveFeedback();
  useEffect(() => { if (!dirty) {setMedia(source);setProfile(settings.profile_image || '');} }, [themeConfig, settings.profile_image]);
  useDirtyWarning(dirty);
  const upload = async (key: keyof SiteMedia | 'profile', file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Escolha um arquivo de imagem.'); return; }
    setUploading(key);setUploadError('');
    try { const url = await portfolioStore.uploadFile(file, 'admin-media');
      if (key === 'profile') setProfile(url); else setMedia(prev => ({...prev,[key]:url}));
    } catch (e) {setUploadError(e instanceof Error ? e.message : 'Falha no envio.');}
    finally {setUploading('');}
  };
  const save = () => feedback.run(async () => {
    // Mesma função de salvamento existente; envia um único conjunto de alterações.
    await updateSettings({ profile_image: profile, theme_config: { ...themeConfig, media } });
  });
  const reset = () => {setMedia(source);setProfile(settings.profile_image || '');};
  return <div className="max-w-5xl space-y-6">
    <h2 className="text-2xl font-bold">Gerenciamento de imagens</h2>
    <p className="text-sm opacity-75">Somente a imagem selecionada será alterada. Para capas e galerias dos projetos, use a aba Projetos. Não há recorte ou alteração automática de proporção.</p>
    <AdminActions dirty={dirty} saving={feedback.saving || Boolean(uploading)} onSave={save} onCancel={reset} error={feedback.error || uploadError} success={feedback.success} />
    {mediaFields.map(({ key, section, title, fallback }) => <section key={key} className={cardClass}>
      <div className="text-xs uppercase tracking-widest opacity-75">{section}</div><h3 className="font-bold">{title}</h3>
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <img src={media[key] || fallback} alt={`Prévia: ${title}`} className="w-full sm:w-56 max-h-44 object-contain rounded border border-[var(--color-border)] bg-black/30" />
        <div className="flex-1 w-full space-y-3"><label className={fieldClass}><span>URL da imagem</span><input className={inputClass} value={media[key]} onChange={e => setMedia({...media,[key]:e.target.value})} placeholder="Use a imagem original ou cole uma URL" /></label>
          <label className="inline-flex p-2 border rounded cursor-pointer text-sm">{uploading===key ? 'Enviando…' : 'Carregar imagem'}<input type="file" accept="image/*" className="sr-only" onChange={e => upload(key,e.target.files?.[0])}/></label>
          {media[key] && <button type="button" onClick={() => setMedia({...media,[key]:''})} className="text-sm underline ml-3">Restaurar imagem original</button>}
        </div>
      </div>
    </section>)}
    <section className={cardClass}><h3 className="font-bold">SOBRE — Foto de apresentação</h3>
      {profile && <img alt="Prévia do retrato" src={profile} className="w-36 h-44 object-contain border rounded" />}
      <label className={fieldClass}><span>URL</span><input className={inputClass} value={profile} onChange={e => setProfile(e.target.value)}/></label>
      <label className="inline-flex p-2 border rounded cursor-pointer text-sm">Carregar fotografia<input type="file" accept="image/*" className="sr-only" onChange={e => upload('profile',e.target.files?.[0])}/></label>
      <button type="button" onClick={() => setProfile('')} className="text-sm underline ml-3">Remover fotografia</button>
    </section>
    <AdminActions dirty={dirty} saving={feedback.saving || Boolean(uploading)} onSave={save} onCancel={reset} error={feedback.error || uploadError} success={feedback.success} />
  </div>;
};
