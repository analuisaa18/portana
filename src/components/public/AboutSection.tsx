import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MultiLine, backgroundVars, useSiteContent } from './siteContent';

interface AboutSectionProps { onNavigateContact?: () => void; }

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateContact }) => {
  const { settings } = useTheme();
  const { text, media } = useSiteContent();
  // Sem texto longo cadastrado: se houver bio curta ela já aparece em destaque, sem repetir.
  const paragraphs = (settings.about_text || (settings.short_bio ? '' : 'Estudo Design e tenho interesse em criar projetos que unem conceito, estética e funcionalidade, com foco em interfaces digitais, identidade visual e design editorial.'))
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // A segunda linha do título ganha o recuo da composição original ("SOBRE / MIM").
  const [firstLine, ...otherLines] = text.aboutHeading.split('\n');

  return (
    <section className="ref-page ref-page--about" aria-label="Sobre mim" style={backgroundVars(media.aboutBackground)}>
      <div className="ref-about__copy">
        <h1>
          {firstLine}
          {otherLines.map((line, i) => <React.Fragment key={i}><br /><span>{line}</span></React.Fragment>)}
        </h1>
        {settings.short_bio && <p className="ref-about__lead">{settings.short_bio}</p>}
        <div className="ref-about__text">
          {paragraphs.map((p, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}
        </div>
        {onNavigateContact && text.aboutButton && (
          <button type="button" className="ref-cta ref-cta--pink" onClick={onNavigateContact}>
            <span>{text.aboutButton}</span><ArrowUpRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {settings.profile_image ? (
        <div className="ref-about__visual">
          <img src={settings.profile_image} alt={`Retrato de ${settings.portfolio_name || 'autora'}`} />
        </div>
      ) : (
        <div className="ref-about__visual" aria-hidden="true" />
      )}

      <span className="ref-star ref-star--about-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--about-2" aria-hidden="true">✦</span>
    </section>
  );
};
