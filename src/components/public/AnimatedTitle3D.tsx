import React, { useEffect, useId, useRef } from 'react';

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

/**
 * Deformable wrapped typography inspired by the supplied reference.
 * The important difference from a ribbon is that there is NO backing panel:
 * the type itself is the deformable object. Multiple offset copies create the
 * long extrusion/echo seen in the reference, while SVG turbulence bends the
 * letterforms as one soft body.
 */
export const AnimatedTitle3D: React.FC<AnimatedTitle3DProps> = ({
  line1 = 'PROJETOS &',
  line2 = 'CONCEITOS',
  surfaceColor = '#7c6dff',
  textColor = '#17121b',
  shadowColor = '#17121b',
  intensity = 1.2,
  speed = 1,
  mouseStrength = 1.1,
  enabled = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const warpGroupRef = useRef<SVGGElement>(null);
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const turbulence = turbulenceRef.current;
    const displacement = displacementRef.current;
    const group = warpGroupRef.current;
    if (!root || !turbulence || !displacement || !group) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const started = performance.now();

    const move = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };
    const leave = () => { targetX = 0; targetY = 0; };

    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);

    const frame = (now: number) => {
      x += (targetX - x) * 0.085;
      y += (targetY - y) * 0.085;

      const t = ((now - started) / 1000) * Math.max(0.05, speed);
      const i = Math.max(0, intensity);
      const m = Math.max(0, mouseStrength);

      // One soft-body motion: vertical waves + horizontal squeeze + tilt.
      const waveX = Math.sin(t * 1.18) * 15 * i + x * 28 * m;
      const waveY = Math.sin(t * 1.55 + x * 1.7) * 11 * i + y * 18 * m;
      const rotate = Math.sin(t * 0.8) * 3.2 * i + x * 5.5 * m;
      const skew = Math.sin(t * 0.9) * 2.5 * i + x * 7 * m;
      const scaleX = 1 + Math.sin(t * 0.75) * 0.025 * i;
      const scaleY = 1 + Math.cos(t * 0.9) * 0.035 * i;

      group.setAttribute(
        'transform',
        `translate(${waveX} ${waveY}) rotate(${rotate} 540 180) skewX(${skew}) scale(${scaleX} ${scaleY})`,
      );

      const warp = (15 + i * 24) + Math.abs(x) * 20 * m + Math.abs(y) * 10 * m;
      displacement.setAttribute('scale', String(warp));
      turbulence.setAttribute('seed', String(Math.floor(t * 8) % 10000));
      turbulence.setAttribute('baseFrequency', `${0.006 + i * 0.002} ${0.018 + i * 0.011}`);

      root.style.setProperty('--wrapped-depth', `${10 + i * 14 + Math.abs(x) * 24 * m}px`);
      root.style.setProperty('--wrapped-shadow-x', `${x * 9 * m}px`);
      root.style.setProperty('--wrapped-shadow-y', `${10 + y * 5 * m}px`);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
    };
  }, [enabled, intensity, speed, mouseStrength]);

  if (!enabled) return null;

  // Many close copies create the long, elastic extrusion/echo of the reference.
  const depthLayers = Array.from({ length: 22 }, (_, index) => index);

  return (
    <div
      ref={rootRef}
      className="animated-title-3d animated-title-3d--wrapped-gif"
      aria-label={`${line1} ${line2}`}
      style={{ '--shadow-color': shadowColor } as React.CSSProperties}
    >
      <svg
        className="animated-title-3d-svg--wrapped"
        viewBox="0 0 1080 360"
        role="img"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={`${id}-body`} x="-25%" y="-35%" width="150%" height="175%" colorInterpolationFilters="sRGB">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.008 0.025"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="28"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={`${id}-soft`} x="-25%" y="-35%" width="150%" height="175%">
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id={`${id}-grain`} width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.55" fill={surfaceColor} opacity="0.18" />
            <circle cx="4" cy="3" r="0.45" fill={surfaceColor} opacity="0.11" />
          </pattern>
        </defs>

        <g ref={warpGroupRef} filter={`url(#${id}-body)`}>
          {/* Back-to-front extrusion: same glyph, increasingly displaced in Z/X/Y. */}
          {depthLayers.map((layer) => {
            const p = layer / (depthLayers.length - 1);
            const dx = p * 38;
            const dy = p * 34;
            const wobble = Math.sin(layer * 0.75) * 3;
            const opacity = 0.08 + (1 - p) * 0.34;
            const strokeWidth = 2.2 + (1 - p) * 2.2;
            return (
              <g key={layer} transform={`translate(${dx} ${dy + wobble})`} opacity={opacity}>
                <text x="540" y="160" textAnchor="middle" className="animated-title-3d-text--gif" fill="none" stroke={surfaceColor} strokeWidth={strokeWidth}>
                  {line1}
                </text>
                <text x="540" y="268" textAnchor="middle" className="animated-title-3d-text--gif" fill="none" stroke={surfaceColor} strokeWidth={strokeWidth}>
                  {line2}
                </text>
              </g>
            );
          })}

          {/* Dense outline echo */}
          <text x="540" y="160" textAnchor="middle" className="animated-title-3d-text--gif animated-title-3d-text--outline" fill={textColor} stroke={surfaceColor} strokeWidth="10">
            {line1}
          </text>
          <text x="540" y="268" textAnchor="middle" className="animated-title-3d-text--gif animated-title-3d-text--outline" fill={textColor} stroke={surfaceColor} strokeWidth="10">
            {line2}
          </text>

          {/* Dark inner echo gives the characteristic nested/inked look. */}
          <text x="540" y="160" textAnchor="middle" className="animated-title-3d-text--gif animated-title-3d-text--front" fill={textColor} stroke={shadowColor} strokeWidth="2.5">
            {line1}
          </text>
          <text x="540" y="268" textAnchor="middle" className="animated-title-3d-text--gif animated-title-3d-text--front" fill={textColor} stroke={shadowColor} strokeWidth="2.5">
            {line2}
          </text>

          <rect x="170" y="48" width="740" height="290" fill={`url(#${id}-grain)`} opacity="0.22" pointerEvents="none" />
        </g>
      </svg>
      <span className="sr-only">{line1} {line2}</span>
    </div>
  );
};

export default AnimatedTitle3D;
