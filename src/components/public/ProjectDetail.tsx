import React, { useEffect, useState } from 'react';
import { Project, ProjectBlock } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { LoadingState } from '../common/LoadingState';
import { TextBlock } from '../blocks/TextBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { YoutubeBlock } from '../blocks/YoutubeBlock';
import { AudioBlock } from '../blocks/AudioBlock';
import { ArrowLeft, Calendar, Tag, AlertCircle } from 'lucide-react';
import { P5SketchBlock } from '../blocks/P5SketchBlock';
import { useSiteContent } from './siteContent';
import { P5Layers } from '../../p5/P5Layers';

interface ProjectDetailProps {
  slug: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<ProjectBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { text } = useSiteContent();

  useEffect(() => {
    let active = true;
    const fetchProject = async () => {
      setLoading(true);
      try {
        // getProjectBySlug já devolve os blocos — não é preciso buscá-los de novo.
        // Rascunhos continuam protegidos pelo RLS: visitantes só recebem projetos publicados.
        const found = await portfolioStore.getProjectBySlug(slug, true);
        if (!active) return;
        setProject(found);
        setBlocks(found?.blocks || []);
        if (found?.title) document.title = found.title;
      } catch (err) {
        console.error('Erro ao buscar detalhes do projeto:', err);
        if (active) setProject(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProject();
    return () => { active = false; };
  }, [slug]);

  return (
    <section className="ref-page ref-page--detail" aria-label="Detalhe do projeto">
      <div className="ref-detail">
        {loading ? (
          <LoadingState message="Carregando projeto..." />
        ) : !project ? (
          <div className="ref-detail__state">
            <AlertCircle size={44} aria-hidden="true" style={{ margin: '0 auto', color: '#ec83aa' }} />
            <h2>Projeto não encontrado</h2>
            <p>O projeto solicitado não existe ou foi despublicado.</p>
            <button type="button" className="ref-detail__back" onClick={onBack}>
              <ArrowLeft size={14} /> Ver todos os projetos
            </button>
          </div>
        ) : (
          <article>
            <button type="button" className="ref-detail__back" onClick={onBack}>
              <ArrowLeft size={14} aria-hidden="true" /> {text.detailBack}
            </button>

            <header className="ref-detail__header">
              {(project.category || project.year) && (
                <div className="ref-detail__meta">
                  {project.category?.name && (
                    <span className="ref-detail__chip"><Tag size={12} aria-hidden="true" />{project.category.name}</span>
                  )}
                  {project.year ? (
                    <span className="ref-detail__chip"><Calendar size={12} aria-hidden="true" />{project.year}</span>
                  ) : null}
                </div>
              )}

              <h1 className="ref-detail__title">{project.title}</h1>

              {project.short_description && <p className="ref-detail__lead">{project.short_description}</p>}

              {project.status === 'rascunho' && (
                <p className="ref-detail__draft">
                  <AlertCircle size={16} aria-hidden="true" />
                  Pré-visualização: este projeto é um RASCUNHO e só aparece para a administradora.
                </p>
              )}
            </header>

            {project.cover_image && (
              <figure className="ref-detail__cover">
                <img src={project.cover_image} alt={`Imagem de capa do projeto ${project.title}`} />
              </figure>
            )}

            <div className="ref-detail__blocks" aria-label="Conteúdo do projeto">
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
              ) : !project.cover_image ? (
                <p className="ref-detail__empty">O conteúdo deste projeto está sendo preparado.</p>
              ) : null}
            </div>

            <footer className="ref-detail__footer">
              <button type="button" className="ref-detail__back" onClick={onBack}>
                <ArrowLeft size={14} aria-hidden="true" /> Ver todos os projetos
              </button>
            </footer>
          </article>
        )}
      </div>
      <P5Layers place="projeto" />
      <span className="ref-star" aria-hidden="true" style={{ left: '4%', top: '30%', fontSize: 34 }}>✦</span>
    </section>
  );
};
