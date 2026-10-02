import React from 'react';
import { MapPin, Mail, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';

interface AboutSectionProps {
  onNavigateContact?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateContact }) => {
  const { settings } = useTheme();

  return (
    <main className="editorial-about-page" aria-label="Sobre mim">
      <section className="editorial-about-page__panel">
        <div className="editorial-about-page__index">01 / 04</div>
        <div className="editorial-about-page__floating-star editorial-about-page__floating-star--one" aria-hidden="true"><span className="editorial-star-mark editorial-star-mark--burst" aria-hidden="true" /></div>
        <div className="editorial-about-page__floating-star editorial-about-page__floating-star--two" aria-hidden="true"><span className="editorial-star-mark editorial-star-mark--diamond" aria-hidden="true" /></div>

        <div className="editorial-about-page__content">
          <div className="editorial-about-page__text">
            <h1>SOBRE<br />MIM</h1>

            {settings.short_bio && (
              <p className="editorial-about-page__intro">{settings.short_bio}</p>
            )}

            <div className="editorial-about-page__body">
              {(settings.about_text || 'Olá, eu sou Ana.\n\nSou estudante e tenho interesse por design de interfaces, tipografia, fotografia e tudo que envolve comunicação visual.').split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="editorial-about-page__details">
              {settings.location && (
                <span><MapPin size={14} /> {settings.location}</span>
              )}
              {settings.email_public && (
                <a href={`mailto:${settings.email_public}`}>
                  <Mail size={14} /> {settings.email_public}
                </a>
              )}
              {settings.whatsapp && (
                <span><MessageSquare size={14} /> WhatsApp disponível</span>
              )}
            </div>

            {onNavigateContact && (
              <Button
                onClick={onNavigateContact}
                variant="primary"
                className="editorial-about-page__button"
                icon={<ArrowUpRight className="w-4 h-4" />}
              >
                VAMOS CONVERSAR
              </Button>
            )}
          </div>

          <div className="editorial-about-page__visual">
            <div className="editorial-about-page__paper">
              {settings.profile_image ? (
                <img
                  src={settings.profile_image}
                  alt={`Fotografia de ${settings.portfolio_name}`}
                />
              ) : (
                <div className="editorial-about-page__placeholder">
                  {settings.portfolio_name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="editorial-about-page__doodle"><span className="editorial-star-mark editorial-star-mark--burst" aria-hidden="true" /></div>
            <div className="editorial-about-page__brush"><span className="editorial-star-mark editorial-star-mark--diamond" aria-hidden="true" /></div>
          </div>
        </div>
      </section>
    </main>
  );
};
