import React from 'react';
import { Project } from '../../types/portfolio';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (slug: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { themeConfig } = useTheme();
  const ctaText = themeConfig.ctaLabel || 'VER PROJETO';

  return (
    <article className="theme-card flex flex-col h-full overflow-hidden group border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all duration-300">
      {/* Cover Image Container */}
      {project.cover_image && (
        <div className="relative aspect-16/10 overflow-hidden bg-[#050505] border-b border-[var(--color-border)]">
          <img
            src={project.cover_image}
            alt={`Capa do projeto: ${project.title}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
            loading="lazy"
          />
          {project.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] shadow-md">
                DESTAQUE
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            {project.category && (
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-accent)]">
                {project.category.name}
              </span>
            )}
            {project.year && (
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                // {project.year}
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
            {project.title}
          </h3>

          {project.short_description && (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed font-medium">
              {project.short_description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => onSelect(project.slug)}
            className="w-full py-3 px-4 text-xs font-black uppercase tracking-[0.2em] rounded-[var(--radius-sm)] bg-white text-black hover:bg-[var(--color-accent)] hover:text-white transition-all flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-2"
            aria-label={`${ctaText}: ${project.title}`}
          >
            <span>{ctaText}</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
