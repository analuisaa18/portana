import React from 'react';
import { Category } from '../../types/portfolio';
import { Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  totalProjectsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalProjectsCount,
}) => {
  return (
    <nav className="my-10 relative z-10" aria-label="Filtro de categorias de projetos">
      <ul className="flex flex-wrap items-center gap-3">
        <li>
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            aria-pressed={selectedCategoryId === null}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] rounded-[var(--radius-sm)] border transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategoryId === null
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-black'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-white hover:text-white'
            }`}
          >
            {selectedCategoryId === null && <Check className="w-3.5 h-3.5 text-white" />}
            <span>TODOS OS PROJETOS</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
              {totalProjectsCount}
            </span>
          </button>
        </li>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] rounded-[var(--radius-sm)] border transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-black'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-white hover:text-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{cat.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
