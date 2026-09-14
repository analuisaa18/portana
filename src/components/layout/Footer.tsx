import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--color-border)] bg-[#080808] py-12 mt-20 transition-colors relative z-10">
      <div className="max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-2xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">
            {settings.portfolio_name || 'STUDIO.X'}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-text-secondary)]">
            {settings.tagline || 'Infraestrutura de Portfólio Autoral Acessível'}
          </p>
        </div>

        {/* Social Links */}
        {settings.social_links && settings.social_links.length > 0 && (
          <ul className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
            {settings.social_links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline decoration-[var(--color-accent)] underline-offset-4 hover:decoration-white"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-secondary)] text-left md:text-right space-y-1">
          <p>© {currentYear} — TODOS OS DIREITOS RESERVADOS</p>
          <p className="inline-flex items-center gap-1.5 opacity-80">
            <span>ACESSIBILIDADE RADICAL</span>
            <Heart className="w-3 h-3 text-[var(--color-accent)] fill-current inline" />
            <span>WCAG 2.2 AA</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
