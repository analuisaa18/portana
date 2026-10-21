import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import collageDesktop from '../../assets/identity/colagem-desktop.png';
import collageMobile from '../../assets/identity/colagem-mobile.png';
import { Project } from '../../types/portfolio';

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'projetos';
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({ onNavigate }) => {
  return (
    <section className="ref-page ref-page--home" aria-label="Portfólio">
      <div className="ref-home__copy">
        <h1>PORTFÓLIO</h1>
        <p>DESIGN DE INTERFACES,<br />PROJETOS GRÁFICOS E<br />EXPERIÊNCIAS VISUAIS.</p>
        <button type="button" className="ref-cta" onClick={() => onNavigate('projetos')}>
          <span>VER PROJETOS</span><ArrowUpRight size={14} strokeWidth={2.2} />
        </button>
      </div>

      <picture className="ref-home__collage">
        <source media="(max-width: 640px)" srcSet={collageMobile} />
        <img src={collageDesktop} alt="Colagem visual com laptop, Pantone e materiais gráficos" />
      </picture>

      {/* Button link to p5.js typography experiment */}
      <div style={{ position: 'absolute', bottom: '32px', left: '10.3%', zIndex: 10 }}>
        <a
          href="#projeto/experimento-p5js-3d"
          className="text-xs font-mono uppercase tracking-widest text-[#0a0a0a] bg-[#ed83aa] px-3 py-2 rounded font-bold hover:opacity-90 inline-block"
        >
          ✦ Experimento p5.js Interativo
        </a>
      </div>

      <span className="ref-star ref-star--home-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--home-2" aria-hidden="true">✦</span>
    </section>
  );
};
