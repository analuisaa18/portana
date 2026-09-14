import React from 'react';
import { ProjectBlock } from '../../types/portfolio';

interface TextBlockProps {
  block: ProjectBlock;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block }) => {
  if (!block.content) return null;

  // Render paragraphs separated by double newlines or lines
  const paragraphs = block.content.split('\n\n').filter(Boolean);

  return (
    <article className="my-6 space-y-4 max-w-3xl">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-base md:text-lg text-[var(--color-text-primary)] leading-relaxed">
          {p}
        </p>
      ))}
    </article>
  );
};
