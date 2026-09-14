import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, Mail, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Button } from '../common/Button';

interface AboutSectionProps {
  onNavigateContact?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateContact }) => {
  const { settings } = useTheme();

  return (
    <section className="py-12 animate-fade-in max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-4 space-y-6">
          {settings.profile_image ? (
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] shadow-md bg-[var(--color-surface)]">
              <img
                src={settings.profile_image}
                alt={`Fotografia de perfil de ${settings.portfolio_name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-[var(--radius-xl)] bg-[var(--color-primary)]/10 border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] text-4xl font-bold">
              {settings.portfolio_name.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* Quick Details Card */}
          <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
            {settings.location && (
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>{settings.location}</span>
              </div>
            )}

            {settings.email_public && (
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <Mail className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <a
                  href={`mailto:${settings.email_public}`}
                  className="hover:text-[var(--color-text-primary)] underline decoration-[var(--color-border)]"
                >
                  {settings.email_public}
                </a>
              </div>
            )}

            {settings.whatsapp && (
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <MessageSquare className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                <span>WhatsApp Disponível</span>
              </div>
            )}

            {onNavigateContact && (
              <div className="pt-2">
                <Button
                  onClick={onNavigateContact}
                  variant="primary"
                  className="w-full"
                  icon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Iniciar Contato
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bio & Text */}
        <div className="md:col-span-8 space-y-8">
          <div>
            <h2 className="bold-eyebrow mb-3">
              APRESENTAÇÃO & METODOLOGIA
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-[var(--color-text-primary)] leading-[0.9]">
              {settings.about_title || 'SOBRE MIM'}
            </h1>
            {settings.short_bio && (
              <p className="text-lg md:text-2xl text-[var(--color-text-secondary)] font-medium mt-6 leading-relaxed border-l-2 border-[var(--color-accent)] pl-4 italic">
                "{settings.short_bio}"
              </p>
            )}
          </div>

          <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--color-accent)] border-b border-white/10 pb-3">
              TRAJETÓRIA E FILOSOFIA DE TRABALHO
            </h3>
            <div className="prose prose-invert max-w-none space-y-4 text-base md:text-lg text-[var(--color-text-primary)] leading-relaxed font-medium">
              {settings.about_text.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Social Links List */}
          {settings.social_links && settings.social_links.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Plataformas & Redes Externas
              </h3>
              <div className="flex flex-wrap gap-3">
                {settings.social_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] text-sm font-medium text-[var(--color-text-primary)] transition-all flex items-center gap-2"
                  >
                    <span>{link.platform}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
