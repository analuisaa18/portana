import React, { useState } from 'react';
import { AlertCircle, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_SITE_CONTENT, DEFAULT_SITE_CONTACT } from '../../services/defaultData';

export const ContactSection: React.FC = () => {
  const { settings, themeConfig } = useTheme();
  const text = themeConfig.content || DEFAULT_SITE_CONTENT;
  const contact = themeConfig.contact || DEFAULT_SITE_CONTACT;
  const [formData, setFormData] = useState({ nome: '', assunto: '', mensagem: '' });
  const [errors, setErrors] = useState<{ nome?: string; assunto?: string; mensagem?: string }>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!formData.nome.trim()) next.nome = 'Informe seu nome.';
    if (!formData.assunto.trim()) next.assunto = 'Informe o assunto.';
    if (!formData.mensagem.trim()) next.mensagem = 'Escreva sua mensagem.';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!contact.whatsappEnabled) return;
    const number = (settings.whatsapp || '').replace(/\D/g, '');
    if (!number) {
      window.alert('O WhatsApp ainda não foi configurado no painel administrativo.');
      return;
    }
    const text = encodeURIComponent(`${contact.whatsappMessage}\n\nMeu nome é ${formData.nome}.\nAssunto: ${formData.assunto}\n\n${formData.mensagem}`);
    window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="ref-page ref-page--contact" aria-label="Contato">
      <div className="ref-contact__heading">
        <p style={{ whiteSpace: 'pre-line' }}>{text.contactEyebrow}</p>
        <h1>{text.contactHeading}</h1>
        <span>{text.contactDescription}</span>
      </div>

      <div className="ref-contact__columns">
        <aside className="ref-contact__card ref-contact__info">
          <h2 style={{ whiteSpace: 'pre-line' }}>{text.contactDetailsHeading}</h2>
          {contact.whatsappEnabled && settings.whatsapp && <div><MessageSquare size={17} /><span><strong>WhatsApp</strong>{settings.whatsapp}</span></div>}
          {settings.email_public && <div><Mail size={17} /><span><strong>Correio Eletrônico</strong>{settings.email_public}</span></div>}
          {settings.location && <div><MapPin size={17} /><span><strong>Localização</strong>{settings.location}</span></div>}
        </aside>

        {contact.whatsappEnabled && <form className="ref-contact__card ref-contact__form" onSubmit={submit} noValidate>
          <h2 style={{ whiteSpace: 'pre-line' }}>{text.contactFormHeading}</h2>
          <label>{text.contactNameLabel}<input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Ana" />{errors.nome && <small><AlertCircle size={11} /> {errors.nome}</small>}</label>
          <label>{text.contactSubjectLabel}<input value={formData.assunto} onChange={(e) => setFormData({ ...formData, assunto: e.target.value })} placeholder="Ex: Projeto de identidade visual" />{errors.assunto && <small><AlertCircle size={11} /> {errors.assunto}</small>}</label>
          <label>{text.contactMessageLabel}<textarea rows={4} value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} placeholder="Escreva detalhes sobre o que você deseja conversar..." />{errors.mensagem && <small><AlertCircle size={11} /> {errors.mensagem}</small>}</label>
          {contact.whatsappEnabled && <button type="submit"><Send size={13} /> {contact.whatsappButtonText}</button>}
        </form>}
      </div>

      <span className="ref-star ref-star--contact-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--contact-2" aria-hidden="true">✦</span>
    </section>
  );
};
