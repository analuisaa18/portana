import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { portfolioStore } from '../../services/store';
import { Button } from '../common/Button';
import { Toast, ToastMessage } from '../common/Toast';
import { SocialLink, UXVoice } from '../../types/portfolio';
import { Save, Upload, Plus, Trash2, User, MessageSquare, Mail, MapPin } from 'lucide-react';

interface SettingsEditorProps {
  onSaved?: () => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({ onSaved }) => {
  const { settings, updateSettings } = useTheme();

  const [formData, setFormData] = useState({
    portfolio_name: settings.portfolio_name || '',
    tagline: settings.tagline || '',
    about_title: settings.about_title || '',
    about_text: settings.about_text || '',
    short_bio: settings.short_bio || '',
    profile_image: settings.profile_image || '',
    whatsapp: settings.whatsapp || '',
    email_public: settings.email_public || '',
    location: settings.location || '',
    github_username: settings.github_username || '',
    ux_voice: settings.ux_voice || ('direto' as UXVoice),
    social_links: settings.social_links || [],
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const uploadedUrl = await portfolioStore.uploadFile(file, 'profile');
      setFormData({ ...formData, profile_image: uploadedUrl });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Imagem de perfil enviada',
        message: 'A fotografia de perfil foi carregada com sucesso.',
      });
    } catch (err) {
      console.error('Erro no upload da imagem:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro no upload',
        message: 'Não foi possível enviar a imagem.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: 'GitHub',
      url: 'https://',
      label: 'github.com/usuario',
    };
    setFormData({
      ...formData,
      social_links: [...formData.social_links, newLink],
    });
  };

  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...formData.social_links];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, social_links: updated });
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = formData.social_links.filter((_, i) => i !== index);
    setFormData({ ...formData, social_links: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(formData);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Configurações Salvas',
        message: 'As informações de perfil e página Sobre foram atualizadas com sucesso.',
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Não foi possível salvar as informações.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Perfil & Apresentação "Sobre"
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Gerencie o nome do portfólio, texto biográfico, imagem de perfil e contatos públicos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identidade Inicial */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Identidade do Portfólio</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="setting-name" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Nome do Portfólio / Autor(a) *
              </label>
              <input
                id="setting-name"
                type="text"
                value={formData.portfolio_name}
                onChange={(e) => setFormData({ ...formData, portfolio_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-tagline" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Tagline / Subtítulo Profissional
              </label>
              <input
                id="setting-tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setting-bio" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Resumo / Frase em Destaque (Short Bio)
            </label>
            <input
              id="setting-bio"
              type="text"
              value={formData.short_bio}
              onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Profile Image URL or File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Fotografia de Perfil (URL ou Arquivo)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {formData.profile_image && (
                <img
                  src={formData.profile_image}
                  alt="Pré-visualização do perfil"
                  className="w-20 h-20 rounded-[var(--radius-lg)] object-cover border border-[var(--color-border)]"
                />
              )}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  value={formData.profile_image}
                  onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fazer Upload do Computador</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Texto do "Sobre" */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Página "Sobre" em Detalhes
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="setting-about-title" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Título da Seção Sobre
            </label>
            <input
              id="setting-about-title"
              type="text"
              value={formData.about_title}
              onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setting-about-text" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Texto Principal da Biografia / Apresentação
            </label>
            <textarea
              id="setting-about-text"
              rows={6}
              value={formData.about_text}
              onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
              placeholder="Escreva sobre sua história, projetos, métodos e inspirações..."
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
            />
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Separe parágrafos com duas quebras de linha para formatar o texto limpo.
            </p>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--color-success)]" />
            <span>Contatos Públicos</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="setting-github-username" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Usuário GitHub (Sincronia Automática)
              </label>
              <input
                id="setting-github-username"
                type="text"
                value={formData.github_username}
                onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                placeholder="Ex: anabochenek"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-whatsapp" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                WhatsApp (DDI/DDD)
              </label>
              <input
                id="setting-whatsapp"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Ex: 5551999998888"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-email" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                E-mail Público
              </label>
              <input
                id="setting-email"
                type="email"
                value={formData.email_public}
                onChange={(e) => setFormData({ ...formData, email_public: e.target.value })}
                placeholder="ana.bocheneck@acad.ufsm.br"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setting-location" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Localização / Estado
              </label>
              <input
                id="setting-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Santa Maria, RS - Brasil"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Links Sociais */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Plataformas & Links Externos
            </h3>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="px-3 py-1 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Link</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.social_links.map((link, idx) => (
              <div key={link.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                  placeholder="Plataforma (Ex: GitHub)"
                  className="sm:col-span-3 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)]"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)}
                  placeholder="https://..."
                  className="sm:col-span-5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)]"
                />
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateSocialLink(idx, 'label', e.target.value)}
                  placeholder="Rótulo Visível"
                  className="sm:col-span-3 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocialLink(idx)}
                  className="sm:col-span-1 p-1.5 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-[var(--radius-sm)] flex justify-center cursor-pointer"
                  title="Remover Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
};
