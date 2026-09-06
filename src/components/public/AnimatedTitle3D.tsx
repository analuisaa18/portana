import React, { useEffect, useRef } from 'react';

interface AnimatedTitle3DProps {
  line1?: string;
  line2?: string;
  surfaceColor?: string;
  textColor?: string;
  shadowColor?: string;
  intensity?: number;
  speed?: number;
  mouseStrength?: number;
  enabled?: boolean;
}

export const AnimatedTitle3D: React.FC<AnimatedTitle3DProps> = ({
  line1 = 'PROJETOS &',
  line2 = 'CONCEITOS',
  surfaceColor = '#9f8ca5',
  textColor = '#ffffff',
  shadowColor = '#4d3b50',
  intensity = 1,
  speed = 1,
  mouseStrength = 1,
  enabled = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const ribbon = ribbonRef.current;
    const text = textRef.current;
    if (!root || !ribbon || !text) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    let t0 = performance.now();

    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2;
      ty = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2;
    };
    const leave = () => { tx = 0; ty = 0; };

    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);

    const animate = (now: number) => {
      x += (tx - x) * 0.075;
      y += (ty - y) * 0.075;
      const t = (now - t0) * 0.001 * speed;
      const i = Math.max(0, intensity);
      const m = Math.max(0, mouseStrength);

      const rx = x * 2.2 * m;
      const ry = -y * 2.8 * m;
      const rz = Math.sin(t * 0.9) * 1.2 * i + x * 1.8 * m;
      const sx = 1 + Math.sin(t * 0.8) * 0.012 * i;
      const sy = 1 + Math.cos(t * 0.65) * 0.012 * i;
      const px = x * 14 * m;
      const py = y * 7 * m + Math.sin(t * 1.3) * 2.5 * i;

      ribbon.setAttribute('transform', `translate(${px} ${py}) rotate(${rz} 540 105) scale(${sx} ${sy})`);
      text.setAttribute('transform', `translate(${px * 0.72} ${py * 0.72}) rotate(${rz * 0.9} 540 105) scale(${sx} ${sy})`);
      root.style.setProperty('--title-tilt-x', `${rx}deg`);
      root.style.setProperty('--title-tilt-y', `${ry}deg`);
      root.style.setProperty('--title-z', `${18 + Math.abs(x) * 18 * m}px`);
      root.style.setProperty('--title-wave', `${Math.sin(t * 1.1) * 5 * i}px`);
      root.style.transform = `perspective(1200px) translate3d(0, var(--title-wave), 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sx}, ${sy})`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
    };
  }, [enabled, intensity, speed, mouseStrength]);

  if (!enabled) return null;

  const id = React.useId().replace(/:/g, '');

  return (
    <div ref={rootRef} className="animated-title-3d animated-title-3d--ribbon" aria-label={`${line1} ${line2}`}>
      <svg className="animated-title-3d-svg" viewBox="0 0 1080 210" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id={`${id}-soft`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="0.35" />
          </filter>
          <filter id={`${id}-warp`} x="-15%" y="-40%" width="130%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.035" numOctaves="2" seed="9" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={8 + intensity * 10} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={`${id}-surface`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={surfaceColor} stopOpacity="0.98" />
            <stop offset="0.5" stopColor={surfaceColor} stopOpacity="0.72" />
            <stop offset="1" stopColor={surfaceColor} stopOpacity="0.94" />
          </linearGradient>
          <linearGradient id={`${id}-shine`} x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <g ref={ribbonRef} filter={`url(#${id}-warp)`} className="animated-title-3d-ribbon">
          <path d="M35 57 C210 20 320 83 470 46 C625 8 735 55 1045 31 L1045 165 C790 143 665 176 505 151 C350 127 210 187 35 157 Z" fill={shadowColor} opacity="0.42" transform="translate(10 13)" />
          <path d="M35 47 C210 10 320 73 470 36 C625 -2 735 45 1045 21 L1045 155 C790 133 665 166 505 141 C350 117 210 177 35 147 Z" fill={`url(#${id}-surface)`} />
          <path d="M35 47 C210 10 320 73 470 36 C625 -2 735 45 1045 21 L1045 155 C790 133 665 166 505 141 C350 117 210 177 35 147 Z" fill={`url(#${id}-shine)`} />
        </g>

        <g ref={textRef} filter={`url(#${id}-soft)`} className="animated-title-3d-text-group">
          {[18, 14, 10, 6].map((d) => (
            <React.Fragment key={d}>
              <text x="540" y="91" textAnchor="middle" className="animated-title-3d-text animated-title-3d-text--line1" fill={shadowColor} transform={`translate(${d} ${d + 8})`}>{line1}</text>
              <text x="540" y="151" textAnchor="middle" className="animated-title-3d-text animated-title-3d-text--line2" fill={shadowColor} transform={`translate(${d} ${d + 8})`}>{line2}</text>
            </React.Fragment>
          ))}
          <text x="540" y="91" textAnchor="middle" className="animated-title-3d-text animated-title-3d-text--line1" fill={textColor}>{line1}</text>
          <text x="540" y="151" textAnchor="middle" className="animated-title-3d-text animated-title-3d-text--line2" fill={textColor}>{line2}</text>
        </g>
      </svg>
      <span className="sr-only">{line1} {line2}</span>
    </div>
  );
};
