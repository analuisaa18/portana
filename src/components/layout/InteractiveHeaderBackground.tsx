import React from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));

export const InteractiveHeaderBackground: React.FC<Props> = ({ header, pointer }) => {
  if (header.backgroundEnabled === false) return null;
  const opacity = clamp(header.backgroundOpacity ?? 0.72, 0, 1);
  const intensity = clamp(header.backgroundIntensity ?? 1, 0, 3);
  const parallax = clamp(header.backgroundParallax ?? 1, 0, 3);
  const gridSize = clamp(header.backgroundGridSize ?? 42, 18, 100);
  const perspective = clamp(header.backgroundPerspective ?? 700, 250, 1800);
  const kind = header.backgroundType ?? 'hybrid';
  const mx = pointer.x * parallax * 18;
  const my = pointer.y * parallax * 12;
  const accent = 'var(--color-accent)';

  return (
    <div className="header-3d-scene" aria-hidden="true" style={{ opacity, perspective: `${perspective}px` }}>
      <div className="header-3d-scene__wash" />
      {(kind === 'grid' || kind === 'hybrid') && (
        <div
          className="header-3d-grid"
          style={{
            '--grid-size': `${gridSize}px`,
            '--grid-opacity': `${0.2 + intensity * 0.16}`,
            '--grid-x': `${mx}px`,
            '--grid-y': `${my}px`,
            '--grid-rotate': `${pointer.x * parallax * 5}deg`,
          } as React.CSSProperties}
        />
      )}
      {(kind === 'orbits' || kind === 'hybrid') && (
        <div className="header-3d-orbits" style={{ transform: `translate3d(${mx * 1.3}px, ${my * 1.2}px, 0) rotateX(${pointer.y * -8}deg) rotateY(${pointer.x * 10}deg)` }}>
          <span className="header-3d-orbit header-3d-orbit--a" />
          <span className="header-3d-orbit header-3d-orbit--b" />
          <span className="header-3d-orbit header-3d-orbit--c" />
        </div>
      )}
      {(kind === 'particles' || kind === 'hybrid') && (
        <div className="header-3d-particles" style={{ transform: `translate3d(${mx * 1.8}px, ${my * 1.7}px, ${Math.abs(pointer.x + pointer.y) * 20}px)` }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={{
              left: `${(i * 37) % 100}%`, top: `${(i * 53 + 9) % 100}%`,
              width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
              background: accent, opacity: 0.18 + (i % 4) * 0.09,
              transform: `translateZ(${(i % 5) * 12}px)`,
            }} />
          ))}
        </div>
      )}
      <div className="header-3d-cursor-glow" style={{ left: `${50 + pointer.x * 28}%`, top: `${50 + pointer.y * 38}%`, boxShadow: `0 0 ${45 + intensity * 35}px ${accent}` }} />
      <div className="header-3d-scene__label">3D FIELD</div>
    </div>
  );
};
