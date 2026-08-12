import React from 'react';
import { ProjectBlock } from '../../types/portfolio';

interface YoutubeBlockProps {
  block: ProjectBlock;
}

// Extract YouTube Video ID safely from various URL formats
function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const YoutubeBlock: React.FC<YoutubeBlockProps> = ({ block }) => {
  const videoId = getYoutubeVideoId(block.media_url);

  if (!videoId) {
    return (
      <div className="my-6 p-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm">
        URL do vídeo do YouTube inválida ou não especificada.
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

  return (
    <figure className="my-8">
      <div className="video-responsive rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xs bg-black">
        <iframe
          src={embedUrl}
          title={block.content || 'Vídeo incorporado do YouTube'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {(block.content || block.caption) && (
        <figcaption className="mt-3 text-sm text-[var(--color-text-secondary)]">
          {block.content && <strong className="block text-[var(--color-text-primary)]">{block.content}</strong>}
          {block.caption && <span>{block.caption}</span>}
        </figcaption>
      )}
    </figure>
  );
};
