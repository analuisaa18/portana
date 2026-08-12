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

  // Filter projects by category
  const filteredProjects = selectedCategoryId
    ? projects.filter((p) => p.category_id === selectedCategoryId)
    : projects;

  const { settings } = useTheme();

  return (
    <section className="py-12 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] relative overflow-hidden">
      {/* Background Watermark Text from Bold Typography Theme */}
      <div className="absolute top-10 right-[-2%] text-[240px] md:text-[360px] font-black text-white/[0.02] leading-none pointer-events-none select-none z-0">
        024
      </div>

      {/* Intro Header */}
      <div className="mb-10 relative z-10 max-w-4xl">
        <h2 className="bold-eyebrow mb-4">
          ACERVO AUTORAL & INVESTIGAÇÃO
        </h2>
        <h1 className="text-4xl sm:text-6xl md:text-8xl bold-hero-title text-[var(--color-text-primary)] mb-6">
          PROJETOS &<br />
          <span className="text-[var(--color-accent)]">CONCEITOS</span>
        </h1>
        <p className="text-base md:text-xl text-[var(--color-text-secondary)] font-medium max-w-2xl leading-relaxed">
          Exploração de tipografia radical, arquitetura de informação e narrativas visuais contemporâneas.
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--layout-gap)] my-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
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
            Não há projetos publicados vinculados à categoria selecionada neste momento.
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
      <GitHubShowcase githubUsername={settings.github_username || 'anabochenek'} />
    </section>
  );
};
