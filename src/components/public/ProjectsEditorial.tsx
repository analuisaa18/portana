import React from 'react';
import { Project } from '../../types/portfolio';
import { MultiLine, backgroundVars, useSiteContent } from './siteContent';

interface ProjectsEditorialProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
}

// Mostrados apenas enquanto não houver nenhum projeto publicado,
// para a página não ficar vazia.
const fallbackLabels = ['IDENTIDADE VISUAL', 'PROJETOS GRÁFICOS', 'INTERFACES', 'DESENHOS E PINTURAS'];

const getCover = (project: Project) =>
  project.cover_image || (project as any).thumbnail || (project as any).image_url || '';

export const ProjectsEditorial: React.FC<ProjectsEditorialProps> = ({ projects, onSelectProject }) => {
  // Antes a página cortava fixo em 4 itens e os demais projetos publicados sumiam.
  const published = projects.filter((project) => project?.slug);
  const { text, media } = useSiteContent();

  return (
    <section className="ref-page ref-page--projects" aria-label="Projetos" style={backgroundVars(media.projectsBackground)}>
      <h1 className="ref-projects__title"><MultiLine text={text.projectsHeading} /></h1>

      <div className="ref-projects__grid">
        {published.length > 0
          ? published.map((project) => {
              const image = getCover(project);
              const meta = [project.category?.name, project.year].filter(Boolean).join(' · ');
              return (
                <button
                  key={project.id || project.slug}
                  type="button"
                  className="ref-project-card"
                  onClick={() => onSelectProject(project.slug)}
                  aria-label={`Abrir projeto ${project.title}`}
                >
                  <span className="ref-project-card__image">
                    {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : null}
                  </span>
                  <span className="ref-project-card__label">{project.title?.trim() || 'Projeto sem título'}</span>
                  {meta && <span className="ref-project-card__meta">{meta}</span>}
                </button>
              );
            })
          : fallbackLabels.map((label) => (
              <div key={label} className="ref-project-card" aria-hidden="true">
                <span className="ref-project-card__image" />
                <span className="ref-project-card__label">{label}</span>
              </div>
            ))}
      </div>

      {published.length === 0 && (
        <p className="ref-projects__empty">{text.projectsEmpty}</p>
      )}

      <span className="ref-star ref-star--projects-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--projects-2" aria-hidden="true">✧</span>
    </section>
  );
};

export default ProjectsEditorial;
