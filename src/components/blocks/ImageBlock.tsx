import React, { useState } from 'react';
import { ProjectBlock } from '../../types/portfolio';
import { Modal } from '../common/Modal';
import { ZoomIn } from 'lucide-react';

interface ImageBlockProps {
  block: ProjectBlock;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!block.media_url) return null;

  return (
    <figure className="my-8 group">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <img
          src={block.media_url}
          alt={block.alt_text || 'Imagem do projeto'}
          className="w-full h-auto object-cover max-h-[700px] transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-3 right-3 p-2 bg-black/70 text-white rounded-[var(--radius-md)] opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          aria-label="Expandir imagem"
        >
          <ZoomIn className="w-4 h-4" />
          <span>Ampliar</span>
        </button>
      </div>

      {block.caption && (
        <figcaption className="mt-2.5 text-sm text-[var(--color-text-secondary)] italic text-center">
          {block.caption}
        </figcaption>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={isZoomed}
        onClose={() => setIsZoomed(false)}
        title={block.caption || block.alt_text || 'Visualização da Imagem'}
        maxWidth="xl"
      >
        <div className="flex flex-col items-center">
          <img
            src={block.media_url}
            alt={block.alt_text || 'Imagem ampliada do projeto'}
            className="w-full max-h-[80vh] object-contain rounded-[var(--radius-md)]"
          />
          {block.caption && (
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] text-center">
              {block.caption}
            </p>
          )}
        </div>
      </Modal>
    </figure>
  );
};
