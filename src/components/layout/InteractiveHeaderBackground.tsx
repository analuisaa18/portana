import React, { useEffect, useState } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  header: ThemeHeader;
  pointer: { x: number; y: number };
  active: boolean;
}

export const InteractiveHeaderBackground: React.FC<Props> = ({ header, pointer, active }) => {
  const [tick, setTick] = useState(0);
  const enabled = header.animationBackground !== false;
  const intensity = Math.max(0, Math.min(3, header.animationBackgroundIntensity ?? 1));
  const parallax = Math.max(0, Math.min(3, header.animationBackgroundParallax ?? 1));
  const grid = Math.max(0, Math.min(2, header.animationBackgroundGrid ?? 1));

  useEffect(() => {
    if (!enabled || !active) return;
    let raf = 0;
    const loop = (now: number) => {
      setTick(now * 0.001);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, active]);

  if (!enabled) return null;

  const px = pointer.x;
  const py = pointer.y;
  const drift = Math.sin(tick * 1.4) * 10 * intensity;
  const rotX = -py * 8 * parallax;
  const rotY = px * 10 * parallax;
  const glowX = 50 + px * 24 * parallax;
  const glowY = 50 + py * 28 * parallax;

  return (
    <div
      className="interactive-header-bg"
      aria-hidden="true"
      style={{
        opacity: 0.88 + Math.min(0.12, intensity * 0.04),
        '--ihb-x': `${px * 28}px`,
        '--ihb-y': `${py * 18}px`,
        '--ihb-rot-x': `${rotX}deg`,
        '--ihb-rot-y': `${rotY}deg`,
        '--ihb-glow-x': `${glowX}%`,
        '--ihb-glow-y': `${glowY}%`,
        '--ihb-grid-opacity': `${0.08 + grid * 0.08}`,
        '--ihb-drift': `${drift}px`,
      } as React.CSSProperties}
    >
      <div className="interactive-header-bg__grid" />
      <div className="interactive-header-bg__plane" />
      <div className="interactive-header-bg__noise" />
      <div className="interactive-header-bg__glow interactive-header-bg__glow--a" />
      <div className="interactive-header-bg__glow interactive-header-bg__glow--b" />
      <div className="interactive-header-bg__ring interactive-header-bg__ring--1" />
      <div className="interactive-header-bg__ring interactive-header-bg__ring--2" />
      <div className="interactive-header-bg__dust">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{
            '--i': i,
            '--dx': `${((i * 37) % 17) - 8}px`,
            '--dy': `${((i * 19) % 13) - 6}px`,
          } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
};
