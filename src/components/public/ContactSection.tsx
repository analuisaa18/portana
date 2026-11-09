import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { P5Layers } from '../../p5/P5Layers';
import { MultiLine, backgroundVars, useSiteContent } from './siteContent';

const safeUrl = (url: string) => (/^(https?:|mailto:)/i.test(url.trim()) ? url.trim() : '');

export const ContactSection: React.FC = () => {
  const { settings } = useTheme();
  const { text, media, contact } = useSiteContent();
  const [formData, setFormData] = useState({ nome: '', assunto: '', mensagem: '' });
  const [errors, setErrors] = useState<{ nome?: string; assunto?: string; mensagem?: string }>({});
  const [notice, setNotice] = useState('');
  const whatsappDigits = (settings.whatsapp || '').replace(/\D/g, '');
  const whatsappOn = contact.whatsappEnabled !== false && Boolean(whatsappDigits);
  const socialLinks = (Array.isArray(settings.social_links) ? settings.social_links : [])
    .filter((link) => link && link.enabled !== false && safeUrl(link.url || ''));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!formData.nome.trim()) next.nome = 'Informe seu nome.';
    if (!formData.assunto.trim()) next.assunto = 'Informe o assunto.';
    if (!formData.mensagem.trim()) next.mensagem = 'Escreva sua mensagem.';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!whatsappOn) {
      setNotice(settings.email_public
        ? `O WhatsApp não está disponível no momento. Escreva para ${settings.email_public}.`
        : 'O WhatsApp não está disponível no momento.');
      return;
    }
    setNotice('');
    // Modelo editável no painel: {nome}, {assunto} e {mensagem} são substituídos.
    const template = contact.whatsappMessage || 'Olá! Meu nome é {nome}.\n\nAssunto: {assunto}\n\n{mensagem}';
    let body = template
      .replace(/\{nome\}/g, formData.nome.trim())
      .replace(/\{assunto\}/g, formData.assunto.trim())
      .replace(/\{mensagem\}/g, formData.mensagem.trim());
    if (!template.includes('{mensagem}')) body += `\n\n${formData.mensagem.trim()}`;
    window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="ref-page ref-page--contact" aria-label="Contato" style={backgroundVars(media.contactBackground)}>
      <div className="ref-contact__heading">
        {text.contactEyebrow && <p><MultiLine text={text.contactEyebrow} /></p>}
        <h1><MultiLine text={text.contactHeading} /></h1>
        {text.contactDescription && <span><MultiLine text={text.contactDescription} /></span>}
      </div>

      <div className="ref-contact__columns" style={whatsappOn ? undefined : { gridTemplateColumns: "minmax(0, 520px)", justifyContent: "center" }}>
        <aside className="ref-contact__card ref-contact__info">
          <h2><MultiLine text={text.contactDetailsHeading} /></h2>
          {whatsappOn && <div><MessageSquare size={17} aria-hidden="true" /><span><strong>WhatsApp</strong><a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer">{settings.whatsapp}</a></span></div>}
          {settings.email_public && <div><Mail size={17} aria-hidden="true" /><span><strong>Correio Eletrônico</strong><a href={`mailto:${settings.email_public}`}>{settings.email_public}</a></span></div>}
          {settings.location && <div><MapPin size={17} aria-hidden="true" /><span><strong>Localização</strong>{settings.location}</span></div>}
          {contact.showSocialLinks !== false && socialLinks.length > 0 && (
            <nav className="ref-contact__social" aria-label="Redes sociais">
              {socialLinks.map((link) => (
                <a key={link.id || link.url} href={safeUrl(link.url)} target="_blank" rel="noopener noreferrer">
                  {link.display_label || link.label || link.platform}<ExternalLink size={11} aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </aside>

        {whatsappOn ? (
          <form className="ref-contact__card ref-contact__form" onSubmit={submit} noValidate>
            <h2><MultiLine text={text.contactFormHeading} /></h2>
            <label>{text.contactNameLabel}<input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Ana" autoComplete="name" aria-invalid={Boolean(errors.nome)} />{errors.nome && <small><AlertCircle size={11} /> {errors.nome}</small>}</label>
            <label>{text.contactSubjectLabel}<input value={formData.assunto} onChange={(e) => setFormData({ ...formData, assunto: e.target.value })} placeholder="Ex: Projeto de identidade visual" aria-invalid={Boolean(errors.assunto)} />{errors.assunto && <small><AlertCircle size={11} /> {errors.assunto}</small>}</label>
            <label>{text.contactMessageLabel}<textarea rows={4} value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} placeholder="Escreva detalhes sobre o que você deseja conversar..." aria-invalid={Boolean(errors.mensagem)} />{errors.mensagem && <small><AlertCircle size={11} /> {errors.mensagem}</small>}</label>
            {notice && <p className="ref-contact__notice" role="status">{notice}</p>}
            <button type="submit"><Send size={13} aria-hidden="true" /> {contact.whatsappButtonText || 'Enviar pelo WhatsApp'}</button>
          </form>
        ) : null}
      </div>

      <P5Layers place="contato" />
      <span className="ref-star ref-star--contact-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--contact-2" aria-hidden="true">✦</span>
    </section>
  );
};
