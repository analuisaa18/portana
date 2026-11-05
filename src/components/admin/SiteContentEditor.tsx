import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, ImageUp, RotateCcw, Save, Undo2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { portfolioStore } from '../../services/store';
import { normalizeNavigation } from '../../services/normalizers';
import {
  DEFAULT_SITE_CONTACT,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SITE_MEDIA,
} from '../../services/defaultData';
import { NavigationConfig, SiteContact, SiteContent, SiteMedia } from '../../types/portfolio';
import collageDesktop from '../../assets/identity/colagem-desktop.png';
import collageMobile from '../../assets/identity/colagem-mobile.png';
import pinkDesktop from '../../assets/identity/fundo-02-rosa-desktop.png';
import pinkMobile from '../../assets/identity/fundo-02-rosa-mobile.png';
import blackDesktop from '../../assets/identity/fundo-02-preto-desktop.png';

type Draft = { content: SiteContent; media: SiteMedia; navigation: NavigationConfig; contact: SiteContact };
type Section = 'textos' | 'imagens' | 'menu' | 'contato';

export const ADMIN_BEFORE_LEAVE_EVENT = 'portfolio:admin-before-leave';

const input = 'w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]';
const card = 'p-5 sm:p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5';
const label = 'block text-xs font-semibold text-[var(--color-text-primary)] space-y-1.5';
const hint = 'block text-[11px] font-normal text-[var(--color-text-secondary)]';

const TEXT_GROUPS: Array<{ title: string; page: string; fields: Array<{ key: keyof SiteContent; label: string; multiline?: boolean }> }> = [
  { title: 'Página inicial', page: '#/', fields: [
    { key: 'homeTitle', label: 'Título grande' },
    { key: 'homeSubtitle', label: 'Subtítulo', multiline: true },
    { key: 'homeButton', label: 'Botão (deixe vazio para esconder)' },
  ]},
  { title: 'Sobre', page: '#/sobre', fields: [
    { key: 'aboutHeading', label: 'Título (a 2ª linha recebe o recuo)', multiline: true },
    { key: 'aboutButton', label: 'Botão para o contato (vazio esconde)' },
  ]},
  { title: 'Projetos', page: '#/projetos', fields: [
    { key: 'projectsHeading', label: 'Título da página' },
    { key: 'projectsEmpty', label: 'Mensagem quando não há projetos publicados' },
    { key: 'detailBack', label: 'Botão "voltar" na página de cada projeto' },
  ]},
  { title: 'Contato', page: '#/contato', fields: [
    { key: 'contactEyebrow', label: 'Chamada acima do título', multiline: true },
    { key: 'contactHeading', label: 'Título' },
    { key: 'contactDescription', label: 'Descrição', multiline: true },
    { key: 'contactDetailsHeading', label: 'Título do cartão de informações', multiline: true },
    { key: 'contactFormHeading', label: 'Título do formulário', multiline: true },
    { key: 'contactNameLabel', label: 'Rótulo do campo nome' },
    { key: 'contactSubjectLabel', label: 'Rótulo do campo assunto' },
    { key: 'contactMessageLabel', label: 'Rótulo do campo mensagem' },
  ]},
];

const IMAGE_FIELDS: Array<{ key: keyof SiteMedia; page: string; title: string; original: string; note?: string }> = [
  { key: 'homeCollageDesktop', page: 'Página inicial', title: 'Colagem principal (computador)', original: collageDesktop, note: 'PNG com fundo transparente fica melhor.' },
  { key: 'homeCollageMobile', page: 'Página inicial', title: 'Colagem principal (celular)', original: collageMobile, note: 'Se ficar vazio, usa a de computador (quando trocada) ou a original.' },
  { key: 'homeBackground', page: 'Página inicial', title: 'Papel de fundo (computador)', original: pinkDesktop },
  { key: 'homeBackgroundMobile', page: 'Página inicial', title: 'Papel de fundo (celular)', original: pinkMobile },
  { key: 'projectsBackground', page: 'Projetos', title: 'Papel de fundo', original: pinkDesktop },
  { key: 'aboutBackground', page: 'Sobre', title: 'Papel de fundo', original: blackDesktop },
  { key: 'contactBackground', page: 'Contato', title: 'Papel de fundo', original: blackDesktop },
];

const MAX_UPLOAD_MB = 8;

const buildDraft = (themeConfig: ReturnType<typeof useTheme>['themeConfig']): Draft => ({
  content: { ...DEFAULT_SITE_CONTENT, ...(themeConfig.content || {}) },
  media: { ...DEFAULT_SITE_MEDIA, ...(themeConfig.media || {}) },
  navigation: normalizeNavigation(themeConfig.navigation),
  contact: { ...DEFAULT_SITE_CONTACT, ...(themeConfig.contact || {}) },
});

export const SiteContentEditor: React.FC = () => {
  const { themeConfig, settings, updateThemeConfig } = useTheme();
  const saved = useMemo(() => buildDraft(themeConfig), [themeConfig]);
  const [draft, setDraft] = useState<Draft>(saved);
  const [section, setSection] = useState<Section>('textos');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  // Quando o tema é recarregado (ex.: salvo em outra aba) e não há edição pendente, acompanha.
  useEffect(() => { if (!dirty) setDraft(saved); }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps

  // Avisa antes de perder alterações (fechar aba, recarregar ou sair do painel).
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const beforeLeave = (event: Event) => {
      if (!window.confirm('Há alterações não salvas em "Conteúdo do Site". Sair mesmo assim?')) event.preventDefault();
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener(ADMIN_BEFORE_LEAVE_EVENT, beforeLeave);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener(ADMIN_BEFORE_LEAVE_EVENT, beforeLeave);
    };
  }, [dirty]);

  const setText = (key: keyof SiteContent, value: string) => setDraft((d) => ({ ...d, content: { ...d.content, [key]: value } }));
  const setMedia = (key: keyof SiteMedia, value: string) => setDraft((d) => ({ ...d, media: { ...d.media, [key]: value } }));
  const setContact = (patch: Partial<SiteContact>) => setDraft((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  const setLinks = (links: NavigationConfig['links']) => setDraft((d) => ({ ...d, navigation: { ...d.navigation, links } }));

  const moveLink = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    const links = [...draft.navigation.links];
    if (target < 0 || target >= links.length) return;
    [links[index], links[target]] = [links[target], links[index]];
    setLinks(links);
  };

  const upload = async (key: keyof SiteMedia, file?: File) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) { setError('Escolha um arquivo de imagem (PNG, JPG, WEBP, SVG ou GIF).'); return; }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) { setError(`A imagem tem mais de ${MAX_UPLOAD_MB} MB. Reduza o arquivo e tente de novo.`); return; }
    setUploading(key);
    try {
      const url = await portfolioStore.uploadFile(file, 'site');
      setMedia(key, url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar a imagem.');
    } finally {
      setUploading('');
    }
  };

  const save = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const digits = (settings.whatsapp || '').replace(/\D/g, '');
      if (draft.contact.whatsappEnabled && digits && (digits.length < 10 || digits.length > 15)) {
        throw new Error('O número de WhatsApp (aba Perfil & Sobre) precisa ter DDI + DDD + número, entre 10 e 15 dígitos.');
      }
      if (!draft.navigation.links.some((l) => l.visible)) {
        throw new Error('Deixe pelo menos um link do menu visível.');
      }
      // Usa o salvamento que já existe: grava dentro de theme_config, sem coluna nova no banco.
      await updateThemeConfig({
        ...themeConfig,
        content: draft.content,
        media: draft.media,
        navigation: draft.navigation,
        contact: draft.contact,
      }, { includeSiteContent: true });
      setSuccess('Salvo. O site público já mostra as alterações.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar no Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const Actions = (
    <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
      <button type="button" onClick={save} disabled={!dirty || saving || Boolean(uploading)}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
        <Save className="w-4 h-4" />{saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
      <button type="button" onClick={() => { setDraft(saved); setError(''); }} disabled={!dirty || saving}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
        <Undo2 className="w-4 h-4" />Desfazer
      </button>
      <a href="#/" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs underline text-[var(--color-text-secondary)]">
        Abrir site em nova aba <ExternalLink className="w-3 h-3" />
      </a>
      <span className="ml-auto text-xs" aria-live="polite">
        {error ? <span role="alert" className="text-[var(--color-error)]">{error}</span>
          : dirty ? <span className="text-[var(--color-warning)]">Alterações não salvas</span>
          : success ? <span className="text-[var(--color-success)]">{success}</span> : null}
      </span>
    </div>
  );

  const resetBtn = (onClick: () => void, visible: boolean) => visible ? (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[11px] underline text-[var(--color-text-secondary)] cursor-pointer">
      <RotateCcw className="w-3 h-3" />Restaurar original
    </button>
  ) : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Conteúdo do site</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Textos, imagens, menu e contato de cada página. Nome, biografia, foto, WhatsApp, e-mail e redes sociais ficam em <strong>Perfil &amp; Sobre</strong>; projetos em <strong>Gerenciar Projetos</strong>; cores e fontes em <strong>Aparência</strong>.
        </p>
      </div>

      {Actions}

      <div role="tablist" aria-label="Partes do conteúdo" className="flex flex-wrap gap-2">
        {([['textos', 'Textos das páginas'], ['imagens', 'Imagens'], ['menu', 'Menu'], ['contato', 'Contato / WhatsApp']] as const).map(([id, name]) => (
          <button key={id} role="tab" type="button" aria-selected={section === id} onClick={() => setSection(id)}
            className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer ${section === id ? 'bg-[var(--color-primary)] text-black border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-primary)]'}`}>
            {name}
          </button>
        ))}
      </div>

      {section === 'textos' && TEXT_GROUPS.map((group) => (
        <section key={group.title} className={card}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-[var(--color-text-primary)]">{group.title}</h3>
            <a href={group.page} target="_blank" rel="noopener" className="text-xs underline text-[var(--color-text-secondary)]">ver página</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {group.fields.map((field) => {
              const value = draft.content[field.key] ?? '';
              const id = `content-${field.key}`;
              return (
                <div key={field.key} className={label}>
                  <label htmlFor={id}>{field.label}</label>
                  {field.multiline ? (
                    <textarea id={id} rows={3} className={input} value={value} onChange={(e) => setText(field.key, e.target.value)} />
                  ) : (
                    <input id={id} className={input} value={value} onChange={(e) => setText(field.key, e.target.value)} />
                  )}
                  <span className="flex items-center justify-between gap-2">
                    {field.multiline ? <span className={hint}>Enter quebra a linha no site.</span> : <span />}
                    {resetBtn(() => setText(field.key, DEFAULT_SITE_CONTENT[field.key]), value !== DEFAULT_SITE_CONTENT[field.key])}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {section === 'imagens' && (
        <>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Envie um arquivo (vai para o Supabase Storage, pasta <code>portfolio-media</code>) ou cole um link. Deixar vazio volta à imagem original. Capas e imagens dos projetos são trocadas em <strong>Gerenciar Projetos</strong>; a foto do Sobre, em <strong>Perfil &amp; Sobre</strong>.
          </p>
          {IMAGE_FIELDS.map((field) => {
            const value = draft.media[field.key];
            const id = `media-${field.key}`;
            return (
              <section key={field.key} className={card}>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)]">{field.page}</span>
                  <h3 className="font-bold text-[var(--color-text-primary)]">{field.title}</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img src={value || field.original} alt="" className="w-full sm:w-56 h-40 object-contain rounded border border-[var(--color-border)] bg-black/40" />
                  <div className="flex-1 w-full space-y-3">
                    <div className={label}>
                      <label htmlFor={id}>Link da imagem</label>
                      <input id={id} className={input} value={value} placeholder="Vazio = imagem original" onChange={(e) => setMedia(field.key, e.target.value)} />
                      {field.note && <span className={hint}>{field.note}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)]">
                        <ImageUp className="w-4 h-4" />{uploading === field.key ? 'Enviando…' : 'Enviar arquivo'}
                        <input type="file" accept="image/*" className="sr-only" disabled={Boolean(uploading)}
                          onChange={(e) => { upload(field.key, e.target.files?.[0]); e.target.value = ''; }} />
                      </label>
                      {resetBtn(() => setMedia(field.key, ''), Boolean(value))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
          <section className={card}>
            <div className={label}>
              <label htmlFor="media-alt">Descrição da colagem para leitores de tela</label>
              <input id="media-alt" className={input} value={draft.media.homeCollageAlt} onChange={(e) => setMedia('homeCollageAlt', e.target.value)} />
              <span className={hint}>Descreva o que a imagem mostra. Acessibilidade (WCAG 1.1.1).</span>
            </div>
          </section>
        </>
      )}

      {section === 'menu' && (
        <section className={card}>
          <h3 className="font-bold text-[var(--color-text-primary)]">Links do menu</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">Renomeie, esconda ou mude a ordem. O nome à esquerda do menu é o "Nome do portfólio" em Perfil &amp; Sobre.</p>
          {draft.navigation.links.map((link, index) => (
            <div key={link.id} className="flex flex-wrap items-end gap-3 pb-4 border-b border-[var(--color-border)]">
              <div className={`${label} flex-1 min-w-40`}>
                <label htmlFor={`nav-${link.id}`}>Página "{link.id}"</label>
                <input id={`nav-${link.id}`} className={input} value={link.label}
                  onChange={(e) => setLinks(draft.navigation.links.map((l) => l.id === link.id ? { ...l, label: e.target.value } : l))} />
              </div>
              <label className="flex items-center gap-2 text-sm pb-2.5">
                <input type="checkbox" checked={link.visible}
                  onChange={(e) => setLinks(draft.navigation.links.map((l) => l.id === link.id ? { ...l, visible: e.target.checked } : l))} />
                Visível
              </label>
              <div className="flex gap-1 pb-1.5">
                <button type="button" className="p-2 rounded border border-[var(--color-border)] disabled:opacity-30 cursor-pointer" aria-label={`Mover ${link.label} para cima`} disabled={index === 0} onClick={() => moveLink(index, -1)}><ArrowUp className="w-4 h-4" /></button>
                <button type="button" className="p-2 rounded border border-[var(--color-border)] disabled:opacity-30 cursor-pointer" aria-label={`Mover ${link.label} para baixo`} disabled={index === draft.navigation.links.length - 1} onClick={() => moveLink(index, 1)}><ArrowDown className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={draft.navigation.showAdminIcon !== false}
              onChange={(e) => setDraft((d) => ({ ...d, navigation: { ...d.navigation, showAdminIcon: e.target.checked } }))} />
            <span>Mostrar o ícone de cadeado (acesso ao admin) no fim do menu.
              <span className={hint}>Mesmo escondido, o painel continua em <code>seusite/#/admin</code>.</span></span>
          </label>
        </section>
      )}

      {section === 'contato' && (
        <section className={card}>
          <h3 className="font-bold text-[var(--color-text-primary)]">WhatsApp e redes</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Número atual: <strong>{settings.whatsapp || 'não cadastrado'}</strong>. Para trocar o número, o e-mail ou as redes sociais, use <strong>Perfil &amp; Sobre</strong>.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.contact.whatsappEnabled} onChange={(e) => setContact({ whatsappEnabled: e.target.checked })} />
            Mostrar formulário e contato de WhatsApp
          </label>
          <div className={label}>
            <label htmlFor="contact-btn">Texto do botão de envio</label>
            <input id="contact-btn" className={input} value={draft.contact.whatsappButtonText} onChange={(e) => setContact({ whatsappButtonText: e.target.value })} />
          </div>
          <div className={label}>
            <label htmlFor="contact-msg">Modelo da mensagem enviada</label>
            <textarea id="contact-msg" rows={5} className={input} value={draft.contact.whatsappMessage} onChange={(e) => setContact({ whatsappMessage: e.target.value })} />
            <span className={hint}>Use {'{nome}'}, {'{assunto}'} e {'{mensagem}'}. Eles são trocados pelo que o visitante escreveu.</span>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.contact.showSocialLinks} onChange={(e) => setContact({ showSocialLinks: e.target.checked })} />
            Mostrar redes sociais (Instagram etc.) no cartão de contato
          </label>
        </section>
      )}

      {Actions}
    </div>
  );
};
