import React from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  config: ThemeHeader;
  pointer: { x: number; y: number };
}

export const InteractiveHeaderBackground: React.FC<Props> = ({ config, pointer }) => {
  if (config.backgroundEnabled === false) return null;
  const intensity = config.backgroundIntensity ?? 1;
  const opacity = config.backgroundOpacity ?? 0.42;
  const parallax = config.backgroundParallax ?? 1;
  const depth = config.backgroundMouseDepth ?? 80;
  const size = config.backgroundGridSize ?? 42;
  const perspective = config.backgroundGridPerspective ?? 900;
  const mix = config.backgroundAccentMix ?? 0.65;
  const px = pointer.x * parallax;
  const py = pointer.y * parallax;
  const gridX = px * 0.9;
  const gridY = py * 0.45;
  const orbX = px * 1.6;
  const orbY = py * 1.2;
  const z = Math.max(0, Math.min(180, depth));
  const showGrid = config.backgroundStyle === 'grid' || config.backgroundStyle === 'hybrid';
  const showOrb = config.backgroundStyle === 'orb' || config.backgroundStyle === 'hybrid';
  const showParticles = config.backgroundStyle === 'particles' || config.backgroundStyle === 'hybrid';

  return (
    <div className="header-3d-scene" aria-hidden="true" style={{ opacity }}>
      {showGrid && (
        <div
          className="header-3d-grid"
          style={{
            backgroundSize: `${size}px ${size}px`,
            perspective: `${perspective}px`,
            transform: `translate3d(${gridX}px, ${gridY}px, ${z * 0.15}px) rotateX(${62 + py * 0.08}deg) rotateY(${px * 0.08}deg) scale(${1 + intensity * 0.04})`,
            opacity: 0.45 + intensity * 0.18,
          }}
        />
      )}
      {showOrb && (
        <>
          <div className="header-3d-orb header-3d-orb--one" style={{ transform: `translate3d(${orbX}px, ${orbY}px, ${z}px) scale(${1 + intensity * 0.12})`, opacity: 0.22 + mix * 0.28 }} />
          <div className="header-3d-orb header-3d-orb--two" style={{ transform: `translate3d(${-orbX * 0.65}px, ${-orbY * 0.8}px, ${z * 0.55}px) rotate(${px * 0.3}deg)`, opacity: 0.12 + mix * 0.2 }} />
        </>
      )}
      {showParticles && (
        <div className="header-3d-particles" style={{ transform: `translate3d(${px * 0.55}px, ${py * 0.4}px, ${z * 0.3}px)` }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, transform: `translateZ(${(i % 5) * 18}px) scale(${0.6 + (i % 4) * 0.18})`, opacity: 0.18 + (i % 4) * 0.08 }} />
          ))}
        </div>
      )}
      <div className="header-3d-vignette" />
    </div>
  );
};
