import React, { useEffect, useRef } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v:number,min:number,max:number) => Math.min(max, Math.max(min, v));

/** Lightweight recreation of the reference field: oversized cropped circles moving behind the header. */
export const HeaderCircleField: React.FC<Props> = ({ header, pointer }) => {
  if (header.circleFieldEnabled === false) return null;

  const bg = header.circleFieldBackground || '#E7E7CE';
  const configuredCircle = header.circleFieldColor;
  // Keep older saved themes compatible: the previous neon-yellow default now follows the portfolio accent.
  const circle = !configuredCircle || configuredCircle.toUpperCase() === '#F2FF00' ? 'var(--color-accent)' : configuredCircle;
  const opacity = clamp(header.circleFieldOpacity ?? 1, 0, 1);
  const size = clamp(header.circleFieldSize ?? 190, 90, 420);
  const motion = clamp(header.circleFieldMotion ?? 0.7, 0, 2);
  const pointerStrength = clamp(header.circleFieldMouse ?? 0.55, 0, 2);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now:number) => {
      const t = (now - start) / 1000;
      const px = pointer.active ? pointer.x : 0;
      const py = pointer.active ? pointer.y : 0;
      el.style.setProperty('--circle-mx', `${px * pointerStrength * 18}px`);
      el.style.setProperty('--circle-my', `${py * pointerStrength * 12}px`);
      el.style.setProperty('--circle-t', `${t * motion}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pointer.active, pointer.x, pointer.y, motion, pointerStrength]);

  const circles = [
    { left:'-8%', top:'-82%', s:1.02, d:0.0 },
    { left:'30%', top:'-105%', s:1.18, d:1.4 },
    { left:'91%', top:'18%', s:1.05, d:2.6 },
    { left:'7%', top:'70%', s:1.12, d:3.5 },
    { left:'43%', top:'82%', s:1.0, d:4.6 },
    { left:'78%', top:'68%', s:1.08, d:5.5 },
  ];

  return (
    <div
      ref={ref}
      className="header-circle-field"
      aria-hidden="true"
      style={{
        backgroundColor: bg,
        opacity,
        ['--circle-size' as any]: `${size}px`,
        ['--circle-color' as any]: circle,
      } as React.CSSProperties}
    >
      {circles.map((c, i) => (
        <span
          key={i}
          className="header-circle-field__circle"
          style={{
            left: c.left,
            top: c.top,
            ['--circle-scale' as any]: c.s,
            ['--circle-delay' as any]: `${c.d}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default HeaderCircleField;
