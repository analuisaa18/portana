import React from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Project } from '../../types/portfolio';
import homeEditorialPhoto from '../../assets/home-editorial-experiment.jpg';

interface PortfolioCollageProps {
  view: 'home' | 'sobre' | 'projetos' | 'contato';
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
}

const fallbackProjectImages = [
  homeEditorialPhoto,
  homeEditorialPhoto,
  homeEditorialPhoto,
  homeEditorialPhoto,
];

const projectImage = (project: Project | undefined, index: number) =>
  project?.cover_image || (project as any)?.thumbnail || (project as any)?.image_url || fallbackProjectImages[index % fallbackProjectImages.length];

const Star = ({ className = '' }: { className?: string }) => (
  <span className={`portfolio-collage__star portfolio-collage__star--burst ${className}`} aria-hidden="true" />
);

const PortfolioCollage: React.FC<PortfolioCollageProps> = ({
  view,
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const cards = projects.slice(0, 4);

  if (view === 'home') {
    return (
      <main className="portfolio-collage portfolio-collage--home">
        <section className="portfolio-collage__home-card">
          <div className="portfolio-collage__index">00 / 04</div>

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

          <div className="portfolio-collage__home-paper portfolio-collage__home-paper--one" />
          <div className="portfolio-collage__home-paper portfolio-collage__home-paper--two" />
          <img
            className="portfolio-collage__home-photo"
            src={homeEditorialPhoto}
            alt="Imagem editorial do portfólio"
          />
          <Star className="portfolio-collage__home-star--one" />
          <Star className="portfolio-collage__home-star--two" />
          <Star className="portfolio-collage__home-star--three" />
        </section>
      </main>
    );
  }

  if (view === 'sobre') {
    return (
      <main className="portfolio-collage portfolio-collage--sobre">
        <section className="portfolio-collage__about-card">
          <div className="portfolio-collage__index">01 / 04</div>

          <div className="portfolio-collage__about-copy">
            <h1>SOBRE<br />MIM</h1>
            <p>
              Olá, eu sou Ana.<br />
              Sou estudante de Design e tenho interesse por design de interfaces,
              tipografia, fotografia e tudo que envolve comunicação visual.
            </p>
            <p>
              Gosto de transformar ideias em projetos que conectam pessoas,
              com soluções simples, funcionais e cheias de personalidade.
            </p>
          </div>

          <div className="portfolio-collage__portrait-wrap">
            <span className="portfolio-collage__portrait-tape" />
            <img
              className="portfolio-collage__portrait"
              src={homeEditorialPhoto}
              alt="Imagem editorial da autora"
            />
            <Star className="portfolio-collage__about-star" />
          </div>
        </section>
      </main>
    );
  }

  if (view === 'projetos') {
    return (
      <main className="portfolio-collage portfolio-collage--projetos">
        <section className="portfolio-collage__projects-card">
          <div className="portfolio-collage__index">02 / 04</div>
          <h1>PROJETOS</h1>

          <div className="portfolio-collage__project-grid">
            {cards.map((project, index) => (
              <button
                type="button"
                className="portfolio-collage__project-card"
                key={project?.id || index}
                onClick={() => project?.slug && onSelectProject(project.slug)}
              >
                <div className="portfolio-collage__project-image-wrap">
                  <img
                    className="portfolio-collage__project-image"
                    src={projectImage(project, index)}
                    alt={project?.title || `Projeto ${index + 1}`}
                  />
                </div>
                <strong>{project?.title || ['IDENTIDADE VISUAL', 'PROJETO GRÁFICO', 'INTERFACES', 'DESENHOS E PINTURAS'][index]}</strong>
                <span>{project?.short_description || 'Processos e experimentações'}</span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="portfolio-collage__principles-card">
          <div className="portfolio-collage__index">03 / 04</div>
          <h2>PRINCÍPIOS</h2>
          <div className="portfolio-collage__principles-content">
            <ul>
              <li>CRIATIVIDADE</li>
              <li>FUNCIONALIDADE</li>
              <li>ESTÉTICA</li>
              <li>AUTENTICIDADE</li>
              <li>PROCESSO</li>
            </ul>
            <div className="portfolio-collage__principles-mark">
              <Star />
            </div>
            <p>“boas ideias<br />também são<br />formas de<br />cuidado.”</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="portfolio-collage portfolio-collage--contato">
      <section className="portfolio-collage__contact-card">
        <div className="portfolio-collage__contact-photo">
          <img src={homeEditorialPhoto} alt="" aria-hidden="true" />
        </div>
        <div className="portfolio-collage__contact-copy">
          <h1>VAMOS<br />CONVERSAR?</h1>
          <div className="portfolio-collage__contact-data">
            <a href="mailto:ana.bocheneck@acad.ufsm.br">
              <Mail size={16} /> anavizzotto@gmail.com
            </a>
            <span><span className="portfolio-collage__instagram-mark">◎</span> @anavizzotto</span>
            <span><MapPin size={16} /> Santa Maria - RS</span>
          </div>
        </div>
      </section>

      <section className="portfolio-collage__closing-card">
        <span>✦ &nbsp; ANA BOCHENECK</span>
        <strong>OBRIGADA<br />POR AQUI!</strong>
        <div className="portfolio-collage__closing-paper" />
        <Star />
      </section>
    </main>
  );
};

export { PortfolioCollage };
export default PortfolioCollage;
