import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { MessageSquare, Mail, MapPin, Send, AlertCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings } = useTheme();

  const [formData, setFormData] = useState({
    nome: '',
    assunto: '',
    mensagem: '',
  });

  const [errors, setErrors] = useState<{ nome?: string; assunto?: string; mensagem?: string }>({});

  const validate = () => {
    const newErrors: { nome?: string; assunto?: string; mensagem?: string } = {};
    if (!formData.nome.trim()) newErrors.nome = 'Por favor, informe seu nome.';
    if (!formData.assunto.trim()) newErrors.assunto = 'Por favor, informe o assunto da mensagem.';
    if (!formData.mensagem.trim()) newErrors.mensagem = 'Por favor, escreva a sua mensagem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const whatsappNumber = settings.whatsapp || '5551999998888';
    // Clean non-digits
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    const messageText = `Olá! Meu nome é ${formData.nome}.\n\nEstou entrando em contato sobre: ${formData.assunto}\n\n${formData.mensagem}`;
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-12 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] animate-fade-in">
      {/* Intro Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto space-y-3">
        <h2 className="bold-eyebrow">
          CANAIS DE COMUNICAÇÃO DIRECTA
        </h2>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">
          INICIAR DIÁLOGO
        </h1>
        <p className="text-base md:text-xl text-[var(--color-text-secondary)] font-medium">
          Preencha o formulário abaixo para enviar uma mensagem diretamente para o WhatsApp de contato profissional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3">
              Informações Diretas
            </h2>

            {settings.whatsapp && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 text-[var(--color-success)] shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">WhatsApp Profissional</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{settings.whatsapp}</p>
                </div>
              </div>
            )}

            {settings.email_public && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Correio Eletrônico</h3>
                  <a
                    href={`mailto:${settings.email_public}`}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline decoration-[var(--color-border)]"
                  >
                    {settings.email_public}
                  </a>
                </div>
              </div>
            )}

            {settings.location && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Localização</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{settings.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Contact Form */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSendWhatsApp}
            className="p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-6"
            noValidate
          >
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3">
              Enviar Mensagem pelo WhatsApp
            </h2>

            {/* Field: Nome */}
            <div className="space-y-1.5">
              <label htmlFor="contact-nome" className="block text-sm font-semibold text-[var(--color-text-primary)]">
                Seu Nome Completo <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="contact-nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Maria Alice Bochenek"
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm"
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? 'error-nome' : undefined}
              />
              {errors.nome && (
                <p id="error-nome" className="text-xs text-[var(--color-error)] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.nome}</span>
                </p>
              )}
            </div>

            {/* Field: Assunto */}
            <div className="space-y-1.5">
              <label htmlFor="contact-assunto" className="block text-sm font-semibold text-[var(--color-text-primary)]">
                Assunto / Proposta <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="contact-assunto"
                type="text"
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                placeholder="Ex: Projeto de Identidade Visual e Interface"
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm"
                aria-invalid={!!errors.assunto}
                aria-describedby={errors.assunto ? 'error-assunto' : undefined}
              />
              {errors.assunto && (
                <p id="error-assunto" className="text-xs text-[var(--color-error)] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.assunto}</span>
                </p>
              )}
            </div>

            {/* Field: Mensagem */}
            <div className="space-y-1.5">
              <label htmlFor="contact-mensagem" className="block text-sm font-semibold text-[var(--color-text-primary)]">
                Mensagem <span className="text-[var(--color-error)]">*</span>
              </label>
              <textarea
                id="contact-mensagem"
                rows={5}
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                placeholder="Escreva os detalhes sobre o que você deseja conversar..."
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm"
                aria-invalid={!!errors.mensagem}
                aria-describedby={errors.mensagem ? 'error-mensagem' : undefined}
              />
              {errors.mensagem && (
                <p id="error-mensagem" className="text-xs text-[var(--color-error)] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.mensagem}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90"
              icon={<Send className="w-4 h-4" />}
            >
              Enviar pelo WhatsApp
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
