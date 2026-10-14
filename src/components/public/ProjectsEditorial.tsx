import React from 'react';
import { Project } from '../../types/portfolio';

interface ProjectsEditorialProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
}

const fallbackLabels = ['IDENTIDADE VISUAL', 'PROJETOS GRÁFICOS', 'INTERFACES', 'DESENHOS E PINTURAS'];

export const ProjectsEditorial: React.FC<ProjectsEditorialProps> = ({ projects, onSelectProject }) => {
  const cards = Array.from({ length: 4 }, (_, index) => projects[index]);

  return (
    <section className="ref-page ref-page--projects" aria-label="Projetos">
      <h1 className="ref-projects__title">PROJETOS</h1>
      <div className="ref-projects__grid">
        {cards.map((project, index) => {
          const image = project?.cover_image || (project as any)?.thumbnail || (project as any)?.image_url;
          return (
            <button
              key={project?.id || index}
              type="button"
              className="ref-project-card"
              disabled={!project?.slug}
              onClick={() => project?.slug && onSelectProject(project.slug)}
            >
              <span className="ref-project-card__image">
                {image ? <img src={image} alt="" loading="lazy" /> : null}
              </span>
              <span className="ref-project-card__label">
                {project?.title?.trim() || fallbackLabels[index]}
              </span>
            </button>
          );
        })}
      </div>
      <span className="ref-star ref-star--projects-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--projects-2" aria-hidden="true">✧</span>
    </section>
  );
};

export default ProjectsEditorial;
