import React, { useEffect, useMemo, useState } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface KineticBrandProps {
  text: string;
  header: ThemeHeader;
  reducedMotion?: boolean;
  className?: string;
  preview?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeFontStack = (value?: string) => {
  const font = value?.trim();
  if (!font) return 'var(--font-headings)';
  if (font.includes(',') || font.includes('var(')) return font;
  return `'${font.replace(/'/g, "\\'")}', sans-serif`;
};

export const KineticBrand: React.FC<KineticBrandProps> = ({
  text,
  header,
  reducedMotion = false,
  className = '',
  preview = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  const letters = useMemo(() => Array.from(text || 'PORTFÓLIO'), [text]);
  const animation = header.animation || 'wave';
  const intensity = clamp(header.animationIntensity ?? 1, 0, 3);
  const speed = clamp(header.animationSpeed ?? 1, 0, 4);
  const depth = clamp(header.animationDepthPx ?? 24, 0, 120);
  const spread = clamp(header.animationSpread ?? 1, 0.1, 3);
  const autoPlay = header.animationAutoPlay ?? false;
  const pointerEnabled = header.animationPointer ?? true;
  const colorMode = header.animationColorMode || 'theme';

  useEffect(() => {
    if (reducedMotion || animation === 'none' || !autoPlay || speed <= 0) {
      setTime(0);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      setTime((now - startedAt) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animation, autoPlay, reducedMotion, speed]);

  const handlePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!pointerEnabled || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    setPointer({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) });
  };

  const getColor = (index: number) => {
    if (colorMode === 'accent') return 'var(--color-accent)';
    if (colorMode === 'alternating') {
      return index % 2 === 0 ? 'var(--color-text-primary)' : 'var(--color-accent)';
    }
    if (colorMode === 'pulse' && !reducedMotion) {
      const mix = 20 + ((Math.sin(time * Math.max(speed, 0.2) * 2 + index * 0.45) + 1) / 2) * 75;
      return `color-mix(in srgb, var(--color-accent) ${mix.toFixed(0)}%, var(--color-text-primary))`;
    }
    return hovered && animation !== 'none' ? 'var(--color-accent)' : 'var(--color-text-primary)';
  };

  const getLetterStyle = (index: number): React.CSSProperties => {
    if (reducedMotion || animation === 'none') {
      return {
        transform: 'translate3d(0,0,0) rotate(0deg) scale(1)',
        color: getColor(index),
      };
    }

    const center = (letters.length - 1) / 2;
    const normalizedIndex = letters.length > 1 ? (index - center) / center : 0;
    const phase = time * speed * 2.15 + index * 0.62 * spread;
    const wave = autoPlay ? Math.sin(phase) : 0;
    const wave2 = autoPlay ? Math.cos(phase * 0.73 + index * 0.18) : 0;
    const px = hovered && pointerEnabled ? pointer.x : 0;
    const py = hovered && pointerEnabled ? pointer.y : 0;
    const active = hovered || autoPlay || pressed;
    const press = pressed ? 1 : 0;

    let transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    let filter = 'none';
    let opacity = 1;
    let textShadow = 'none';

    if (animation === 'wrapped3d') {
      const d = depth * intensity;
      const angle = normalizedIndex * 1.9 + phase * 0.42;
      const z = Math.cos(angle) * d;
      const x = Math.sin(angle) * Math.min(72, 26 + d * 0.55) + px * 18 * (pointerEnabled ? 1 : 0);
      const y = (1 - Math.cos(angle)) * Math.min(16, 5 + d * 0.1) - 7 + py * 12;
      const rx = py * -18 + Math.sin(angle + phase) * 8;
      const ry = -Math.sin(angle) * 62 + px * 24;
      const rz = Math.cos(angle) * 28 + px * 8;
      const scale = 0.78 + (Math.cos(angle) + 1) * 0.13;
      transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
      textShadow = `${-z * 0.025}px ${Math.abs(z) * 0.018}px ${Math.max(2, Math.abs(z) * 0.06)}px color-mix(in srgb,var(--color-accent) 35%,transparent)`;
    }

    if (animation === 'lift') {
      const lift = active ? (-4 - Math.abs(normalizedIndex) * 2) * intensity : 0;
      transform = `translate3d(${px * 2 * intensity}px, ${lift + py * 2 * intensity + wave * 1.5 * intensity}px, 0) rotate(${px * 1.2 * intensity}deg) scale(${1 + (active ? 0.025 : 0) * intensity - press * 0.03})`;
    }

    if (animation === 'wave') {
      const y = (wave * 8 + py * 4 + Math.sin(index * 0.75 + px * 1.5) * (hovered ? 2 : 0)) * intensity;
      const rotation = (wave2 * 3 + px * 2) * intensity;
      transform = `translate3d(${px * normalizedIndex * 3 * intensity}px, ${y}px, 0) rotate(${rotation}deg) scale(${1 + wave * 0.035 * intensity - press * 0.04})`;
    }

    if (animation === 'magnetic') {
      const distanceWeight = 0.6 + (1 - Math.abs(normalizedIndex)) * 0.55;
      const x = px * 10 * distanceWeight * intensity + wave * 1.4 * intensity;
      const y = py * 7 * distanceWeight * intensity + wave2 * 1.2 * intensity;
      transform = `translate3d(${x}px, ${y}px, ${Math.abs(px) * depth * 0.12}px) rotate(${px * 4 * normalizedIndex * intensity}deg) scale(${1 + (hovered ? 0.06 : 0) * distanceWeight * intensity - press * 0.04})`;
    }

    if (animation === 'elastic') {
      const pointerStretch = hovered ? (px * normalizedIndex - py * 0.35) : 0;
      const stretch = (wave * 0.18 + pointerStretch * 0.18) * intensity;
      const sx = clamp(1 + stretch, 0.55, 1.7);
      const sy = clamp(1 - stretch * 0.55 - press * 0.08, 0.65, 1.55);
      const y = (wave2 * 4 + py * 3) * intensity;
      transform = `translate3d(${px * normalizedIndex * 4 * intensity}px, ${y}px, 0) rotate(${wave * 2.5 * intensity}deg) scaleX(${sx}) scaleY(${sy})`;
    }

    if (animation === 'ripple') {
      const pointerPhase = hovered ? px * 2.8 + py * 1.8 : 0;
      const ripple = Math.sin(phase + pointerPhase - Math.abs(normalizedIndex) * 2.2);
      const y = ripple * 10 * intensity;
      const z = Math.cos(phase + pointerPhase) * depth * 0.35 * intensity;
      transform = `translate3d(${normalizedIndex * ripple * 3 * intensity}px, ${y}px, ${z}px) rotateZ(${ripple * 4 * intensity}deg) scale(${1 + ripple * 0.045 * intensity - press * 0.04})`;
      textShadow = `0 ${Math.max(1, depth * 0.05)}px ${Math.max(2, depth * 0.18)}px color-mix(in srgb, var(--color-accent) 30%, transparent)`;
    }

    if (animation === 'orbit') {
      const orbitPhase = phase + normalizedIndex * 1.5 + px * 1.3;
      const z = Math.sin(orbitPhase) * depth * intensity;
      const y = Math.cos(orbitPhase) * Math.min(12, depth * 0.28) * intensity + py * 3 * intensity;
      const rotateY = Math.sin(orbitPhase) * 26 * intensity;
      transform = `translate3d(${px * normalizedIndex * 3 * intensity}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateX(${py * -7 * intensity}deg) scale(${1 + Math.cos(orbitPhase) * 0.035 * intensity - press * 0.03})`;
      textShadow = `${Math.sin(orbitPhase) * 2}px ${Math.cos(orbitPhase) * 2}px ${Math.max(2, depth * 0.14)}px color-mix(in srgb, var(--color-accent) 38%, transparent)`;
    }

    if (animation === 'glitch') {
      const glitchGate = autoPlay ? Math.max(0, Math.sin(time * speed * 8 + index * 1.37)) : 0;
      const hoverGate = hovered ? Math.abs(px) * 0.8 + Math.abs(py) * 0.5 : 0;
      const gate = clamp(glitchGate + hoverGate, 0, 1.4);
      const x = Math.sin(index * 17.13 + time * speed * 21) * 5 * gate * intensity;
      const y = Math.cos(index * 9.71 + time * speed * 17) * 2.5 * gate * intensity;
      transform = `translate3d(${x}px, ${y}px, 0) skewX(${x * 0.55}deg) scaleX(${1 + gate * 0.035})`;
      filter = gate > 0.55 ? `contrast(${1 + gate * 0.35}) saturate(${1 + gate * 0.45})` : 'none';
      textShadow = gate > 0.45
        ? `${2 * intensity}px 0 0 color-mix(in srgb, var(--color-accent) 65%, transparent), ${-2 * intensity}px 0 0 color-mix(in srgb, var(--color-primary) 55%, transparent)`
        : 'none';
      opacity = clamp(1 - gate * 0.08, 0.82, 1);
    }

    if (animation === 'stretch') {
      const localWave = wave + (hovered ? px * normalizedIndex * 0.8 - py * 0.35 : 0);
      const sx = clamp(1 + localWave * 0.28 * intensity, 0.5, 1.85);
      const sy = clamp(1 - localWave * 0.12 * intensity - press * 0.06, 0.7, 1.4);
      const x = normalizedIndex * localWave * 4 * intensity;
      transform = `translate3d(${x}px, ${wave2 * 2 * intensity}px, 0) scaleX(${sx}) scaleY(${sy})`;
    }

    return {
      transform,
      filter,
      opacity,
      textShadow,
      color: getColor(index),
      transformOrigin: '50% 70%',
      transformStyle: 'preserve-3d',
      transition: hovered || pressed
        ? 'transform 90ms linear, color 180ms ease, filter 120ms ease'
        : autoPlay
          ? 'color 180ms ease, filter 120ms ease'
          : 'transform 520ms cubic-bezier(0.16,1,0.3,1), color 240ms ease, filter 180ms ease',
      willChange: 'transform, color, filter',
    };
  };

  return (
    <span
      className={`kinetic-brand inline-flex items-center whitespace-nowrap select-none ${className}`}
      data-animation={animation}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
        setPointer({ x: 0, y: 0 });
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        perspective: `${Math.max(240, depth * 30)}px`,
        transformStyle: 'preserve-3d',
        fontFamily: normalizeFontStack(header.brandFontFamily),
        fontSize: preview ? 'clamp(2rem, 7vw, 5.25rem)' : `${header.brandFontSizePx || 24}px`,
        fontWeight: header.brandWeight || 900,
        letterSpacing: `${header.brandLetterSpacing ?? -0.04}em`,
        lineHeight: 0.9,
        textTransform: 'uppercase',
        touchAction: 'manipulation',
      }}
    >
      {letters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="kinetic-brand-letter inline-block"
          aria-hidden="true"
          style={{
            ...getLetterStyle(index),
            marginInline: `${Math.max(-4, (spread - 1) * 1.5)}px`,
          }}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  );
};
