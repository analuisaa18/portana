import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Project } from '../../types/portfolio';
import homeEditorialPhoto from '../../assets/home-editorial-experiment.jpg';

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/1000/760`;

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'projetos';
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({
  projects,
  onSelectProject,
  onNavigate,
  view = 'home',
}) => {
  const { settings } = useTheme();
  const cards = projects.slice(0, 4);

  const imageFor = (p: Project | undefined, i: number) => {
    const src = (p as any)?.cover_image || (p as any)?.thumbnail || (p as any)?.image_url;
    return src || photo(`portana-editorial-${i + 1}`);
  };

  const Hero = () => (
    <section className="editorial-panel editorial-panel--pink editorial-hero" aria-label="Portfólio">
      <div className="editorial-index">00 / 04</div>

      <div className="editorial-hero-copy">
        <button type="button" className="editorial-hero-title" aria-label="Portfólio — interação">
          PORTFÓLIO
        </button>

        <p>
          DESIGN DE INTERFACES,<br />
          PROJETOS GRÁFICOS E<br />
          EXPERIÊNCIAS VISUAIS.
        </p>

        <button
          type="button"
          className="editorial-hero-projects-cta"
          onClick={() => onNavigate('projetos')}
          aria-label="Ver projetos"
        >
          <span>VER PROJETOS</span>
          <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>

        <div className="editorial-star-doodle" aria-hidden="true">
          <span className="editorial-star-mark editorial-star-mark--burst" />
        </div>
      </div>

      <div className="editorial-hero-paper paper-one" aria-hidden="true" />
      <div className="editorial-hero-paper paper-two" aria-hidden="true" />

      <img
        className="editorial-hero-photo"
        src={homeEditorialPhoto}
        alt="Processo criativo com computador e referências de cor"
      />

      {/* Fitas da colagem: exclusivas da composição mobile. */}
      <span className="editorial-mobile-photo-tape editorial-mobile-photo-tape--one" aria-hidden="true" />
      <span className="editorial-mobile-photo-tape editorial-mobile-photo-tape--two" aria-hidden="true" />
      <span className="editorial-mobile-photo-tape editorial-mobile-photo-tape--three" aria-hidden="true" />

      <div className="editorial-hero-scribble" aria-hidden="true">
        <span className="editorial-star-mark editorial-star-mark--diamond" />
      </div>
      <div className="editorial-hero-star editorial-hero-star--one" aria-hidden="true">
        <span className="editorial-star-mark editorial-star-mark--burst" />
      </div>
      <div className="editorial-hero-star editorial-hero-star--two" aria-hidden="true">
        <span className="editorial-star-mark editorial-star-mark--diamond" />
      </div>

      <span className="editorial-extra-star editorial-extra-star--one" aria-hidden="true" />
      <span className="editorial-extra-star editorial-extra-star--two" aria-hidden="true" />
      <span className="editorial-extra-star editorial-extra-star--three" aria-hidden="true" />
      <span className="editorial-extra-star editorial-extra-star--four" aria-hidden="true" />
    </section>
  );

  const Projects = () => (
    <section className="editorial-panel editorial-panel--pink editorial-projects" aria-label="Projetos">
      <div className="editorial-index">02 / 04</div>
      <div className="editorial-projects-head">
        <h2>PROJETOS</h2>
        <p>Identidades, interfaces e experimentações visuais.</p>
      </div>
      <div className="editorial-project-grid">
        {cards.map((project, index) => (
          <button
            type="button"
            className="editorial-project-card"
            key={project.slug || index}
            onClick={() => onSelectProject(project.slug)}
          >
            <img src={imageFor(project, index)} alt={project.title} />
            <span>{project.title}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );

  if (view === 'home') {
    return (
      <main className="editorial-home editorial-home--single">
        <div className="editorial-grid editorial-grid--single">
          <Hero />
        </div>
      </main>
    );
  }

  return (
    <main className="editorial-home editorial-home--single editorial-home--projects">
      <div className="editorial-grid editorial-grid--single">
        <Projects />
      </div>
    </main>
  );
};
