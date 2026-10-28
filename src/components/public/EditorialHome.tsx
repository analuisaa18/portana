import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import collageDesktop from '../../assets/identity/colagem-desktop.png';
import collageMobile from '../../assets/identity/colagem-mobile.png';
import { Project } from '../../types/portfolio';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_SITE_CONTENT } from '../../services/defaultData';

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'projetos';
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({ onNavigate }) => {
  const { themeConfig } = useTheme();
  const text = themeConfig.content || DEFAULT_SITE_CONTENT;
  const media = themeConfig.media;
  return (
    <section className="ref-page ref-page--home" aria-label="Portfólio">
      <div className="ref-home__copy">
        <h1>{text.homeTitle}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{text.homeSubtitle}</p>
        <button type="button" className="ref-cta cursor-pointer" onClick={() => onNavigate('projetos')}>
          <span>{text.homeButton}</span><ArrowUpRight size={14} strokeWidth={2.2} />
        </button>
      </div>

      <picture className="ref-home__collage">
        <source media="(max-width: 640px)" srcSet={media?.homeCollageMobile || collageMobile} />
        <img src={media?.homeCollageDesktop || collageDesktop} alt="Colagem visual com laptop, Pantone e materiais gráficos" />
      </picture>

      <span className="ref-star ref-star--home-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--home-2" aria-hidden="true">✦</span>
    </section>
  );
};
