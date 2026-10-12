import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Project } from '../../types/portfolio';

interface ProjectsEditorialProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
}

const labels = [
  { title: 'IDENTIDADE VISUAL', description: 'Casa de Cultura de Caçapava do Sul' },
  { title: 'PROJETO GRÁFICO', description: 'Affinity Designer' },
  { title: 'INTERFACES', description: 'Site Casa de Cultura' },
  { title: 'DESENHOS E PINTURAS', description: 'Processos e experimentações' },
];

export const ProjectsEditorial: React.FC<ProjectsEditorialProps> = ({
  projects,
  onSelectProject,
}) => {
  const cards = Array.from({ length: 4 }, (_, index) => projects[index]);

  return (
    <section className="projects-reference-page" aria-label="Projetos">
      <div className="projects-reference__inner">
        <div className="projects-reference__header">
          <h1>PROJETOS</h1>
          <span>02 / 04</span>
        </div>

        <div className="projects-reference__grid">
          {cards.map((project, index) => {
            const item = labels[index];
            const cardTitle = project?.title?.trim() || item.title;
            const cardDescription = project?.short_description?.trim() || item.description;
            const image =
              project?.cover_image ||
              (project as any)?.thumbnail ||
              (project as any)?.image_url ||
              null;

            return (
              <button
                key={project?.id || `project-${index}`}
                type="button"
                className="projects-reference__item"
                onClick={() => project?.slug && onSelectProject(project.slug)}
                disabled={!project?.slug}
              >
                <div className="projects-reference__image-wrap">
                  {image ? (
                    <img
                      src={image}
                      alt={cardTitle}
                      className="projects-reference__image"
                      loading="lazy"
                    />
                  ) : (
                    <span className="projects-reference__image-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="projects-reference__meta">
                  <div className="projects-reference__title">
                    {cardTitle}
                  </div>
                  <div className="projects-reference__description">
                    {cardDescription}
                  </div>
                  <span className="projects-reference__arrow" aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsEditorial;
