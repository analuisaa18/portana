import React from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Project } from '../../types/portfolio';
import homeEditorialPhoto from '../../assets/home-editorial-experiment.jpg';

interface PortfolioCollageProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'sobre' | 'projetos' | 'contato';
}

export const PortfolioCollage: React.FC<PortfolioCollageProps> = ({
  projects,
  onSelectProject,
  onNavigate,
  view = 'home',
}) => {
  const { settings } = useTheme();
  const cards = projects.slice(0, 4);

  const renderCard = () => {
    if (view === 'sobre') {
      return (
        <section className="portfolio-collage__card portfolio-collage__about portfolio-collage__single-card" id="sobre" aria-label="Sobre mim">
          <span className="portfolio-collage__index">01 / 04</span>
          <div className="portfolio-collage__about-copy">
            <h2>SOBRE<br />MIM</h2>
            {settings.short_bio && <p className="portfolio-collage__intro">{settings.short_bio}</p>}
            <div className="portfolio-collage__body">
              {(settings.about_text || '').split('\n\n').filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="portfolio-collage__portrait">
            {settings.profile_image ? (
              <img src={settings.profile_image} alt={`Fotografia de ${settings.portfolio_name}`} />
            ) : (
              <div className="portfolio-collage__portrait-placeholder">AB</div>
            )}
            <span className="portfolio-collage__portrait-paper" />
            <span className="portfolio-collage__portrait-star">✦</span>
          </div>
        </section>
      );
    }

    if (view === 'projetos') {
      return (
        <section className="portfolio-collage__card portfolio-collage__projects portfolio-collage__single-card" id="projetos" aria-label="Projetos">
          <span className="portfolio-collage__index">02 / 04</span>
          <h2>PROJETOS</h2>
          <div className="portfolio-collage__project-grid">
            {cards.map((project, index) => (
              <button
                key={project.slug || index}
                type="button"
                className="portfolio-collage__project"
                onClick={() => onSelectProject(project.slug)}
              >
                <span className="portfolio-collage__project-image">
                  <img src={project.cover_image} alt={project.title} />
                </span>
                <strong>{project.title}</strong>
                <small>{project.short_description}</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (view === 'contato') {
      return (
        <section className="portfolio-collage__card portfolio-collage__contact portfolio-collage__single-card" id="contato" aria-label="Contato">
          <div className="portfolio-collage__contact-image" aria-hidden="true">
            <img src={homeEditorialPhoto} alt="" />
          </div>
          <div className="portfolio-collage__contact-copy">
            <h2>VAMOS<br />CONVERSAR?</h2>
            <div className="portfolio-collage__contact-data">
              {settings.email_public && <span><Mail size={14} /> {settings.email_public}</span>}
              {settings.location && <span><MapPin size={14} /> {settings.location}</span>}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="portfolio-collage__card portfolio-collage__home portfolio-collage__single-card" aria-label="Portfólio">
        <span className="portfolio-collage__index">00 / 04</span>
        <div className="portfolio-collage__home-copy">
          <h1>PORTFÓLIO</h1>
          <p>
            DESIGN DE INTERFACES,<br />
            PROJETOS GRÁFICOS E<br />
            EXPERIÊNCIAS VISUAIS.
          </p>
          <button type="button" onClick={() => onNavigate('projetos')}>
            VER PROJETOS <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="portfolio-collage__home-photo-wrap" aria-hidden="true">
          <img src={homeEditorialPhoto} alt="" />
          <span className="portfolio-collage__torn-paper" />
          <span className="portfolio-collage__pink-mark">✦</span>
        </div>
        <span className="portfolio-collage__star portfolio-collage__star--home" aria-hidden="true" />
      </section>
    );
  };

  return (
    <main className={`portfolio-collage portfolio-collage--single portfolio-collage--${view}`} aria-label="Portfólio autoral">
      <div className="portfolio-collage__single-grid">
        {renderCard()}
      </div>
    </main>
  );
};

export default PortfolioCollage;
