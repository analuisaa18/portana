import React, { useEffect, useState } from 'react';
import { Project, ProjectBlock } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';
import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { YoutubeBlock } from '../blocks/YoutubeBlock';
import { AudioBlock } from '../blocks/AudioBlock';
import { ArrowLeft, Calendar, Tag, AlertCircle } from 'lucide-react';
import { P5SketchBlock } from '../blocks/P5SketchBlock';

interface ProjectDetailProps {
  slug: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<ProjectBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const found = await portfolioStore.getProjectBySlug(slug, true);
        if (found) {
          setProject(found);
          const blockData = await portfolioStore.getProjectBlocks(found.id);
          setBlocks(blockData);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do projeto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return <LoadingState message="Carregando detalhes do projeto..." />;
  }

  if (!project) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-[var(--color-error)] mx-auto" />
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Projeto não encontrado</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          O projeto solicitado não existe ou foi despublicado pelo autor.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 cursor-pointer"
        >
          Voltar para a lista de projetos
        </button>
      </div>
    );
  }

  return (
    <article className="py-8 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] space-y-10 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
        aria-label="Voltar para a galeria de projetos"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar aos Projetos</span>
      </button>

      {/* Rascunho Warning if applicable */}
      {project.status === 'rascunho' && (
        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Modo de Pré-visualização: Este projeto está salvo como RASCUNHO e só está visível para o administrador.</span>
        </div>
      )}

      {/* Project Header */}
      <header className="space-y-4 max-w-4xl border-b border-[var(--color-border)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          {project.category && (
            <Badge variant="outline" size="md">
              <Tag className="w-3.5 h-3.5 mr-1 inline" />
              {project.category.name}
            </Badge>
          )}
          {project.year && (
            <span className="text-sm font-mono text-[var(--color-text-secondary)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {project.year}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-text-primary)]">
          {project.title}
        </h1>

        {project.short_description && (
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed">
            {project.short_description}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {project.cover_image && (
        <figure className="my-8">
          <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] shadow-md bg-[var(--color-surface)]">
            <img
              src={project.cover_image}
              alt={`Imagem principal de capa do projeto ${project.title}`}
              className="w-full h-auto max-h-[600px] object-cover"
            />
          </div>
        </figure>
      )}

      {/* Sequential Blocks Section */}
      <section className="space-y-8 max-w-4xl mx-auto" aria-label="Conteúdo detalhado do projeto">
        {blocks.length > 0 ? (
          blocks.map((block) => {
            switch (block.type) {
              case 'texto':
                return <TextBlock key={block.id} block={block} />;
              case 'imagem':
                return <ImageBlock key={block.id} block={block} />;
              case 'video':
                return <YoutubeBlock key={block.id} block={block} />;
              case 'audio':
                return <AudioBlock key={block.id} block={block} />;
              case 'p5':
                return <P5SketchBlock key={block.id} block={block} />;
              default:
                return null;
            }
          })
        ) : (
          <div className="p-8 text-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm">
            Nenhum bloco de conteúdo adicional foi cadastrado para este projeto ainda.
          </div>
        )}
      </section>

      {/* Bottom Footer Back Link */}
      <footer className="pt-12 border-t border-[var(--color-border)] flex justify-between items-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a lista de projetos</span>
        </button>
      </footer>
    </article>
  );
};
