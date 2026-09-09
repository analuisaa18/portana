import React, { useEffect, useRef } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  text: string;
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const normalizedMouseDepth = (index: number, length: number, mouse: number) => {
  if (length <= 1) return mouse * 4;
  const n = (index / (length - 1)) * 2 - 1;
  return n * mouse * 7;
};

/** Lightweight, readable wrapped-3D typography for the header. */
export const Wrapped3DCanvas: React.FC<Props> = ({ text, header, pointer }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef(pointer);
  pointerRef.current = pointer;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    const start = performance.now();
    let width = 1;
    let height = 1;
    let dpr = 1;
    let visible = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.max(280, r.width);
      height = Math.max(90, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.01 });

    observer.observe(canvas);
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible || now - last < 32) return; // ~30 FPS max
      last = now;

      const p = pointerRef.current;
      const mx = p.active ? clamp(p.x, -1, 1) : 0;
      const my = p.active ? clamp(p.y, -1, 1) : 0;
      const speed = clamp(header.animationSpeed ?? 1, 0.05, 3);
      const intensity = clamp(header.animationIntensity ?? 1, 0.35, 1.65);
      const mouse = clamp(header.animationMouseStrength ?? 1, 0, 1.6);
      const curve = clamp(header.wrappedCurve ?? 1.15, 0.2, 2.5);
      const twist = clamp(header.wrappedTwist ?? 1.1, 0, 2.5);
      const glow = clamp(header.wrappedGlow ?? 0.3, 0, 1);
      const scaleSetting = clamp(header.wrappedScale ?? 1, 0.7, 1.2);
      const t = ((now - start) / 1000) * speed;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      ctx.clearRect(0, 0, width, height);

      const family = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-headings').trim() || 'Arial, sans-serif';
      const phrase = (text || 'PORTFÓLIO').toUpperCase();
      const size = clamp(header.brandFontSizePx ?? 28, 18, 64) * 1.5 * scaleSetting;
      const weight = header.brandWeight ?? 900;
      ctx.font = `${weight} ${size}px ${family}`;
      ctx.textBaseline = 'alphabetic';

      const chars = Array.from(phrase);
      const rawWidths = chars.map(ch => ctx.measureText(ch).width);
      const rawTotal = rawWidths.reduce((a, b) => a + b, 0);
      const padding = Math.max(28, width * 0.055);
      const fit = Math.min(1, (width - padding * 2) / Math.max(rawTotal, 1));
      const total = rawTotal * fit;
      const centerX = width / 2 + mx * width * 0.035 * mouse;
      const centerY = height * 0.56 + my * height * 0.045 * mouse;

      // One continuous wave across the whole word. This preserves readability
      // while still creating the wrapped 3D look from the reference.
      const waveAmplitude = Math.min(7, height * 0.05) * intensity;
      const waveCycles = 0.72 + twist * 0.06;
      const zDepth = Math.min(18, 8 + (header.animationDepthPx ?? 24) * 0.14) * intensity;
      let cursor = -total / 2;

      chars.forEach((ch, index) => {
        const gw = rawWidths[index] * fit;
        const mid = cursor + gw / 2;
        const u = total > 0 ? mid / total : 0;
        const theta = u * Math.PI * waveCycles + t * 0.9 + mx * 0.11 * mouse;
        const wave = Math.sin(theta);
        const z = Math.cos(theta) * zDepth + normalizedMouseDepth(index, chars.length, mx * mouse);
        const x = centerX + mid;
        const y = centerY + wave * waveAmplitude + my * 3 * mouse;
        const rotation = Math.cos(theta) * (1.8 * intensity) + mx * 1.2 * mouse;
        const scale = clamp(1 + Math.cos(theta) * 0.012 * intensity, 0.985, 1.015);
        const alpha = clamp(0.94 + Math.cos(theta) * 0.05, 0.88, 1);

        const textColor = header.wrappedTextColor || '#ffffff';
        const depthColor = header.wrappedSurfaceColor || 'var(--color-accent)';

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scale, scale);

        // Controlled extrusion: enough depth to read as 3D, never enough to
        // stack into an unreadable wall of copies.
        const extrusion = Math.min(5, Math.max(2, Math.abs(z) * 0.08 + 1.5));
        for (let layer = Math.ceil(extrusion); layer >= 1; layer--) {
          ctx.save();
          ctx.globalAlpha = alpha * (0.035 + (extrusion - layer) * 0.012);
          ctx.fillStyle = 'rgba(35, 28, 42, 0.48)';
          ctx.fillText(ch, -gw / 2 + layer * 0.42, layer * 1.25);
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1.2, 1.5 * scale);
        ctx.strokeStyle = depthColor;
        ctx.strokeText(ch, -gw / 2, 0);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = textColor;
        ctx.shadowColor = depthColor;
        ctx.shadowBlur = glow * 3;
        ctx.fillText(ch, -gw / 2, 0);
        ctx.restore();

        ctx.restore();
        cursor += gw;
      });

      if (p.active && !reduced) {
        const gx = width * (0.5 + mx * 0.22);
        const gy = height * (0.5 + my * 0.18);
        const light = ctx.createRadialGradient(gx, gy, 0, gx, gy, height * 0.42);
        light.addColorStop(0, 'rgba(255,255,255,0.09)');
        light.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = light;
        ctx.fillRect(0, 0, width, height);
      }
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [text, header]);

  return <canvas ref={ref} className="wrapped-3d-canvas" aria-label={text} role="img" />;
};

export default Wrapped3DCanvas;
