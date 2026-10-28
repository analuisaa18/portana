import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_SITE_CONTENT } from '../../services/defaultData';
import { SiteContent } from '../../types/portfolio';
import { AdminActions, cardClass, fieldClass, inputClass, useDirtyWarning, useSaveFeedback } from './ConfigEditorShared';

const sections: Array<{name: string; fields: Array<[keyof SiteContent, string]>}> = [
  { name: 'HOME', fields: [['homeTitle', 'Título principal'], ['homeSubtitle', 'Subtítulo (use Enter para quebrar linhas)'], ['homeButton', 'Botão principal']] },
  { name: 'SOBRE', fields: [['aboutHeading', 'Título da página'], ['aboutButton', 'Botão de contato']] },
  { name: 'PROJETOS', fields: [['projectsHeading', 'Título da página']] },
  { name: 'CONTATO', fields: [['contactEyebrow', 'Chamada superior'], ['contactHeading', 'Título'], ['contactDescription', 'Descrição'], ['contactDetailsHeading', 'Título das informações'], ['contactFormHeading', 'Título do formulário'], ['contactNameLabel', 'Campo nome'], ['contactSubjectLabel', 'Campo assunto'], ['contactMessageLabel', 'Campo mensagem']] },
  { name: 'RODAPÉ', fields: [['footerRights', 'Direitos autorais'], ['footerAccessibility', 'Texto de acessibilidade'], ['footerAdminLink', 'Botão Admin']] },
];

export const ContentManager: React.FC = () => {
  const { themeConfig, updateThemeConfig, settings } = useTheme();
  const source = { ...DEFAULT_SITE_CONTENT, ...themeConfig.content };
  const [data, setData] = useState<SiteContent>(source);
  const dirty = JSON.stringify(data) !== JSON.stringify(source);
  const feedback = useSaveFeedback();
  useEffect(() => { if (!dirty) setData(source); }, [themeConfig]);
  useDirtyWarning(dirty);
  const save = () => feedback.run(async () => {
    await updateThemeConfig({ ...themeConfig, content: data });
  });
  return <div className="space-y-6 max-w-5xl">
    <div><h2 className="text-2xl font-bold">Conteúdo por página</h2><p className="text-sm opacity-75 mt-2">Edite e visualize os textos antes de publicar. Nome, biografia, e-mail e localização continuam em “Perfil & Sobre”; os textos específicos de projetos estão em “Projetos”.</p></div>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={() => setData(source)} error={feedback.error} success={feedback.success}/>
    {sections.map(section => <section key={section.name} className={cardClass}>
      <h3 className="font-bold text-lg">{section.name}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {section.fields.map(([key, label]) => <label key={key} className={fieldClass}>
          <span>{label}</span>
          {data[key].includes('\n') || data[key].length > 90 ? <textarea rows={3} className={inputClass} value={data[key]} onChange={e => setData({ ...data, [key]: e.target.value })}/>
            : <input className={inputClass} value={data[key]} onChange={e => setData({ ...data, [key]: e.target.value })}/>}
          <span className="block text-[11px] opacity-65 font-normal">Prévia: <span style={{whiteSpace:'pre-line'}}>{data[key]}</span></span>
        </label>)}
      </div>
    </section>)}
    <p className="text-xs opacity-70">Nome exibido na marca: {settings.portfolio_name}. Outros textos do banco são administrados nas abas correspondentes.</p>
    <AdminActions dirty={dirty} saving={feedback.saving} onSave={save} onCancel={() => setData(source)} error={feedback.error} success={feedback.success}/>
  </div>;
};
