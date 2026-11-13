import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import collageDesktop from '../../assets/identity/colagem-desktop.png';
import collageMobile from '../../assets/identity/colagem-mobile.png';
import { Project } from '../../types/portfolio';
import { P5Layers } from '../../p5/P5Layers';
import { InteractiveStars } from '../common/InteractiveStars';
import { MultiLine, backgroundVars, useSiteContent } from './siteContent';

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'projetos';
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({ onNavigate }) => {
  const { text, media } = useSiteContent();
  // Se o link cadastrado no painel falhar, volta para a colagem original em vez de mostrar imagem quebrada.
  const [customFailed, setCustomFailed] = useState(false);
  useEffect(() => setCustomFailed(false), [media.homeCollageDesktop, media.homeCollageMobile]);
  const useCustom = !customFailed;
  const desktopImage = (useCustom && media.homeCollageDesktop) || collageDesktop;
  // Se só a imagem desktop foi trocada, ela também é usada no celular.
  const mobileImage = (useCustom && (media.homeCollageMobile || media.homeCollageDesktop)) || collageMobile;
  const hasCustom = Boolean(media.homeCollageDesktop || media.homeCollageMobile);

  // Celular (sem hover): o toque no título "PORTFÓLIO" mostra o mesmo efeito do vídeo
  // (cresce com sombra) e ele volta sozinho ao lugar logo depois.
  const [titleLifted, setTitleLifted] = useState(false);
  const liftTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(liftTimer.current), []);
  const liftTitle = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') return;
    setTitleLifted(true);
    window.clearTimeout(liftTimer.current);
    liftTimer.current = window.setTimeout(() => setTitleLifted(false), 1100);
  };

  return (
    <section
      className="ref-page ref-page--home"
      aria-label="Portfólio"
      style={backgroundVars(media.homeBackground, media.homeBackgroundMobile)}
    >
      <div className="ref-home__copy">
        <h1 className={titleLifted ? 'is-lifted' : undefined} onPointerDown={liftTitle}><MultiLine text={text.homeTitle} /></h1>
        {text.homeSubtitle && <p><MultiLine text={text.homeSubtitle} /></p>}
        {text.homeButton && (
          <button type="button" className="ref-cta" onClick={() => onNavigate('projetos')}>
            <span>{text.homeButton}</span><ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </div>

      <picture className="ref-home__collage">
        <source media="(max-width: 640px)" srcSet={mobileImage} />
        <img
          src={desktopImage}
          alt={media.homeCollageAlt || ''}
          onError={() => { if (hasCustom && !customFailed) setCustomFailed(true); }}
        />
      </picture>

      <P5Layers place="home" />
      <InteractiveStars place="home" />
      <span className="ref-star ref-star--home-1" aria-hidden="true">✦</span>
      <span className="ref-star ref-star--home-2" aria-hidden="true">✦</span>
    </section>
  );
};
