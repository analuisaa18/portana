import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_SITE_CONTENT } from '../../services/defaultData';

interface AboutSectionProps { onNavigateContact?: () => void; }

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateContact }) => {
  const { settings, themeConfig } = useTheme();
  const text = { ...DEFAULT_SITE_CONTENT, ...(themeConfig.content || {}) };
  const aboutHeading = typeof text.aboutHeading === 'string' ? text.aboutHeading : DEFAULT_SITE_CONTENT.aboutHeading;
  const paragraphs = (settings.about_text || settings.short_bio || 'Estudo Design e tenho interesse em criar projetos que unem conceito, estética e funcionalidade, com foco em interfaces digitais, identidade visual e design editorial.').split(/\n\s*\n/);

  return (
    <section className="ref-page ref-page--about" aria-label="Sobre mim">
      <div className="ref-about__copy">
        <h1>{aboutHeading.split('\n')[0]}<br /><span>{aboutHeading.split('\n').slice(1).join(' ')}</span></h1>
        {settings.short_bio && <p className="ref-about__lead">{settings.short_bio}</p>}
        <div className="ref-about__text">
          {paragraphs.slice(0, 4).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {onNavigateContact && (
          <button type="button" className="ref-cta ref-cta--pink" onClick={onNavigateContact}>
            <span>{text.aboutButton}</span><ArrowUpRight size={14} />
          </button>
        )}
      </div>

      <div className="ref-about__visual" aria-hidden={!settings.profile_image}>
        {settings.profile_image ? <img src={settings.profile_image} alt={`Retrato de ${settings.portfolio_name || 'autora'}`} /> : null}
      </div>

      <span className="ref-star ref-star--about-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--about-2" aria-hidden="true">✦</span>
    </section>
  );
};
