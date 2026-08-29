import React, { useState } from 'react';
import { Project, Category } from '../../types/portfolio';
import { CategoryFilter } from './CategoryFilter';
import { ProjectCard } from './ProjectCard';
import { GitHubShowcase } from './GitHubShowcase';
import { useTheme } from '../../context/ThemeContext';
import { FolderOpen } from 'lucide-react';

interface ProjectsGridProps {
  projects: Project[];
  categories: Category[];
  onSelectProject: (slug: string) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  categories,
  onSelectProject,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Interação do título
  const [titleHovered, setTitleHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  // Filter projects by category
  const filteredProjects = selectedCategoryId
    ? projects.filter((p) => p.category_id === selectedCategoryId)
    : projects;

  const { settings } = useTheme();

  const projetosLetters = 'PROJETOS'.split('');
  const conceitosLetters = 'CONCEITOS'.split('');

  const getLetterStyle = (
    index: number,
    total: number,
    isAccent: boolean
  ): React.CSSProperties => {
    if (!titleHovered) {
      return {
        display: 'inline-block',
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        transition:
          'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms ease',
        transitionDelay: `${index * 20}ms`,
      };
    }

    const center = (total - 1) / 2;
    const distance = index - center;

    // O cursor cria uma pequena influência sobre cada letra
    const cursorInfluence = mouseX * distance * -0.025;

    // Movimento orgânico diferente para cada letra
    const wave = Math.sin(index * 1.45) * 8;
    const rotation = Math.sin(index * 1.15) * 3;
    const scale = 1 + Math.abs(Math.sin(index * 1.3)) * 0.045;

    return {
      display: 'inline-block',
      transform: `
        translate3d(${cursorInfluence}px, ${wave}px, 0)
        rotate(${rotation}deg)
        scale(${scale})
      `,
      transition:
        'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms ease',
      transitionDelay: `${index * 18}ms`,
      color: isAccent
        ? 'var(--color-accent)'
        : 'var(--color-text-primary)',
    };
  };

  return (
    <section className="py-12 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] relative overflow-hidden">
      {/* Background Watermark Text from Bold Typography Theme */}
      <div className="absolute top-10 right-[-2%] text-[240px] md:text-[360px] font-black text-white/[0.02] leading-none pointer-events-none select-none z-0">
        024
      </div>

      {/* Intro Header */}
      <div className="mb-10 relative z-10 max-w-5xl">

        {/* Pequena identificação editorial */}
        <div
          className="flex items-center gap-3 mb-5"
          style={{
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          <span>ACERVO AUTORAL</span>
          <span
            style={{
              fontSize: '1rem',
              letterSpacing: 0,
              transform: titleHovered ? 'rotate(90deg) scale(1.3)' : 'rotate(0)',
              transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            ✳
          </span>
          <span>INVESTIGAÇÃO</span>
        </div>

        {/* Título artístico e interativo */}
        <div
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => {
            setTitleHovered(false);
            setMouseX(0);
          }}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();

            const x =
              ((event.clientX - rect.left) / rect.width - 0.5) * 2;

            setMouseX(x);
          }}
          style={{
            cursor: 'default',
            display: 'inline-block',
            perspective: '800px',
          }}
        >
          <h1
            aria-label="PROJETOS & CONCEITOS"
            style={{
              margin: 0,
              fontFamily: 'var(--font-headings)',
              fontWeight: 900,
              lineHeight: 0.78,
              letterSpacing: '-0.065em',
              textTransform: 'uppercase',
              position: 'relative',
            }}
          >
            {/* PROJETOS */}
            <span
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                fontSize: 'clamp(4rem, 10vw, 9rem)',
                color: 'var(--color-text-primary)',
                transform: titleHovered
                  ? 'translateX(0.12em) rotate(-0.7deg)'
                  : 'translateX(0) rotate(0)',
                transition:
                  'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {projetosLetters.map((letter, index) => (
                <span
                  key={`projeto-${index}`}
                  style={getLetterStyle(
                    index,
                    projetosLetters.length,
                    false
                  )}
                >
                  {letter}
                </span>
              ))}
            </span>

            {/* & */}
            <span
              style={{
                display: 'block',
                marginLeft: 'clamp(3rem, 16vw, 12rem)',
                marginTop: '0.08em',
                marginBottom: '0.08em',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 400,
                lineHeight: 0.7,
                color: titleHovered
                  ? 'var(--color-accent)'
                  : 'var(--color-text-primary)',
                transform: titleHovered
                  ? 'rotate(8deg) scale(1.18) translateX(0.1em)'
                  : 'rotate(-8deg) scale(1)',
                transformOrigin: 'center',
                transition:
                  'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms ease',
              }}
            >
              &
            </span>

            {/* CONCEITOS */}
            <span
              style={{
                display: 'block',
                whiteSpace: 'nowrap',
                marginLeft: 'clamp(1rem, 8vw, 7rem)',
                fontSize: 'clamp(4.5rem, 11vw, 10rem)',
                color: 'var(--color-accent)',
                transform: titleHovered
                  ? 'translateX(-0.08em) rotate(0.8deg)'
                  : 'translateX(0) rotate(0)',
                transition:
                  'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {conceitosLetters.map((letter, index) => (
                <span
                  key={`conceito-${index}`}
                  style={getLetterStyle(
                    index,
                    conceitosLetters.length,
                    true
                  )}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>

          {/* Linha experimental */}
          <div
            style={{
              width: titleHovered ? '72%' : '18%',
              height: '2px',
              marginTop: '1.5rem',
              background: 'var(--color-accent)',
              transformOrigin: 'left',
              transition:
                'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Descrição */}
        <div
          className="mt-8 flex items-start gap-4 max-w-2xl"
          style={{
            transform: titleHovered
              ? 'translateX(8px)'
              : 'translateX(0)',
            transition:
              'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '3rem',
              minWidth: '3rem',
              height: '2px',
              marginTop: '0.75rem',
              background: 'var(--color-accent)',
            }}
          />

          <p
            className="text-base md:text-xl text-[var(--color-text-secondary)] font-medium leading-relaxed"
          >
            Exploração de tipografia radical, arquitetura de informação e
            narrativas visuais contemporâneas.
          </p>
        </div>
      </div>

      {/* Category Filter Bar */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        totalProjectsCount={projects.length}
      />

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div
          className={`projects-layout projects-layout--${
            settings.theme_config?.layout?.gridStyle || 'standard'
          } my-8`}
          style={
            {
              '--project-grid-columns': Math.min(
                6,
                Math.max(
                  1,
                  settings.theme_config?.layout?.gridColumns || 3
                )
              ),
            } as React.CSSProperties
          }
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={
                index === 0
                  ? 'project-grid-item project-grid-item--first'
                  : 'project-grid-item'
              }
              style={
                index === 0 &&
                (settings.theme_config?.layout?.gridColumns || 3) > 1
                  ? {
                      gridColumn: 'span 2',
                      gridRow: 'span 2',
                    }
                  : undefined
              }
            >
              <ProjectCard
                project={project}
                onSelect={onSelectProject}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="my-16 p-12 text-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto text-[var(--color-text-secondary)]">
            <FolderOpen className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            Nenhum projeto encontrado nesta categoria
          </h3>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Não há projetos publicados vinculados à categoria selecionada
            neste momento.
          </p>

          <button
            onClick={() => setSelectedCategoryId(null)}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 cursor-pointer"
          >
            Ver todos os projetos
          </button>
        </div>
      )}

      {/* Live GitHub Showcase */}
      <GitHubShowcase
        githubUsername={settings.github_username || 'anabochenek'}
      />
    </section>
  );
};
