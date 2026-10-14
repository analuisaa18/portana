import React, { useState } from 'react';
import { AlertCircle, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ContactSection: React.FC = () => {
  const { settings } = useTheme();
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

    const number = (settings.whatsapp || '').replace(/\D/g, '');
    if (!number) {
      window.alert('O WhatsApp ainda não foi configurado no painel administrativo.');
      return;
    }
    const text = encodeURIComponent(`Olá! Meu nome é ${formData.nome}.\n\nAssunto: ${formData.assunto}\n\n${formData.mensagem}`);
    window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="ref-page ref-page--contact" aria-label="Contato">
      <div className="ref-contact__heading">
        <p>CANAIS DE<br />COMUNICAÇÃO<br />DIRETA</p>
        <h1>INICIAR DIÁLOGO</h1>
        <span>Preencha o formulário abaixo para enviar uma mensagem diretamente para o WhatsApp de contato.</span>
      </div>

      <div className="ref-contact__columns">
        <aside className="ref-contact__card ref-contact__info">
          <h2>INFORMAÇÕES<br />DIRETAS</h2>
          {settings.whatsapp && <div><MessageSquare size={17} /><span><strong>WhatsApp</strong>{settings.whatsapp}</span></div>}
          {settings.email_public && <div><Mail size={17} /><span><strong>Correio Eletrônico</strong>{settings.email_public}</span></div>}
          {settings.location && <div><MapPin size={17} /><span><strong>Localização</strong>{settings.location}</span></div>}
        </aside>

        <form className="ref-contact__card ref-contact__form" onSubmit={submit} noValidate>
          <h2>Enviar mensagem pelo<br />WhatsApp</h2>
          <label>Seu Nome Completo *<input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Ana" />{errors.nome && <small><AlertCircle size={11} /> {errors.nome}</small>}</label>
          <label>Assunto / Proposta *<input value={formData.assunto} onChange={(e) => setFormData({ ...formData, assunto: e.target.value })} placeholder="Ex: Projeto de identidade visual" />{errors.assunto && <small><AlertCircle size={11} /> {errors.assunto}</small>}</label>
          <label>Mensagem *<textarea rows={4} value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} placeholder="Escreva detalhes sobre o que você deseja conversar..." />{errors.mensagem && <small><AlertCircle size={11} /> {errors.mensagem}</small>}</label>
          <button type="submit"><Send size={13} /> Enviar pelo WhatsApp</button>
        </form>
      </div>

      <span className="ref-star ref-star--contact-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--contact-2" aria-hidden="true">✦</span>
    </section>
  );
};
