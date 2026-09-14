import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando conteúdos...',
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${minHeight} text-center`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
};
