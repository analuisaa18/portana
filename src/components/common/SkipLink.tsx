import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-[var(--color-primary)] focus:text-white focus:shadow-lg focus:rounded-[var(--radius-md)] focus:font-medium focus:text-sm"
    >
      Pular para o conteúdo principal
    </a>
  );
};
