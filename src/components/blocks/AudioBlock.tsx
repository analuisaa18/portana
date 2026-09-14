import React, { useState } from 'react';
import { ProjectBlock } from '../../types/portfolio';
import { Volume2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface AudioBlockProps {
  block: ProjectBlock;
}

export const AudioBlock: React.FC<AudioBlockProps> = ({ block }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!block.media_url) return null;

  return (
    <figure className="my-8 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-[var(--radius-full)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            {block.content || 'Arquivo de Áudio'}
          </h3>
          {block.caption && (
            <p className="text-xs text-[var(--color-text-secondary)]">{block.caption}</p>
          )}
        </div>
      </div>

      <audio
        controls
        controlsList="nodownload"
        className="w-full h-11 focus:outline-none rounded-[var(--radius-md)]"
        preload="metadata"
      >
        <source src={block.media_url} />
        Seu navegador não suporta o elemento de áudio nativo.
      </audio>

      {/* Accessible Text Transcript Section */}
      {block.transcript && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full py-2 text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            aria-expanded={showTranscript}
            aria-controls={`transcript-${block.id}`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Transcrição textual do áudio</span>
            </span>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTranscript && (
            <div
              id={`transcript-${block.id}`}
              className="mt-3 p-4 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed animate-fade-in"
            >
              {block.transcript}
            </div>
          )}
        </div>
      )}
    </figure>
  );
};
