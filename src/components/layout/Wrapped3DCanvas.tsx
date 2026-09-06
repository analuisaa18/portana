import React, { useEffect, useRef } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  text: string;
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Lightweight horizontal cylinder typography used by the header.
 * It deliberately avoids SVG turbulence/WebGL so the header stays responsive.
 */
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
    let start = performance.now();
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

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.01 });
    observer.observe(canvas);
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible || now - last < 30) return;
      last = now;

      const p = pointerRef.current;
      const mx = p.active ? clamp(p.x, -1, 1) : 0;
      const my = p.active ? clamp(p.y, -1, 1) : 0;
      const speed = clamp(header.animationSpeed ?? 1, 0.05, 3);
      const intensity = clamp(header.animationIntensity ?? 1, 0, 2.5);
      const mouse = clamp(header.animationMouseStrength ?? 1, 0, 2);
      const curve = clamp(header.wrappedCurve ?? 1.15, 0.2, 2.5);
      const twist = clamp(header.wrappedTwist ?? 1.1, 0, 2.5);
      const glow = clamp(header.wrappedGlow ?? 0.3, 0, 1);
      const scaleSetting = clamp(header.wrappedScale ?? 1, 0.65, 1.35);
      const t = ((now - start) / 1000) * speed;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      ctx.clearRect(0, 0, width, height);

      const family = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-headings')
        .trim() || 'Arial, sans-serif';
      const size = clamp(header.brandFontSizePx ?? 28, 18, 64) * 1.72 * scaleSetting;
      const weight = header.brandWeight ?? 900;
      const phrase = (text || 'PORTFÓLIO').toUpperCase();
      ctx.font = `${weight} ${size}px ${family}`;

      const chars = Array.from(phrase);
      const rawWidths = chars.map(ch => ctx.measureText(ch).width);
      const rawTotal = rawWidths.reduce((a, b) => a + b, 0);
      const fit = Math.min(1, (width * 0.92) / Math.max(rawTotal, 1));
      const radius = Math.max(220, width * 0.72);
      const arc = Math.PI * (0.88 + curve * 0.13);
      const centerX = width / 2 + mx * width * 0.05 * mouse;
      const centerY = height * 0.52 + my * height * 0.06 * mouse;

      let cursor = -rawTotal * fit / 2;

      chars.forEach((ch, index) => {
        const gw = rawWidths[index] * fit;
        const u = (cursor + gw / 2) / Math.max(rawTotal * fit, 1);
        const theta = u * arc
          + Math.sin(t * 0.75 + index * 0.2) * 0.025 * intensity
          + mx * 0.22 * mouse;
        const front = Math.max(0.06, Math.cos(theta));
        const side = Math.sin(theta);
        const x = centerX + side * radius * 0.42;
        const wave = Math.sin(theta * (2.1 + twist) + t * 1.05) * height * 0.16 * intensity;
        const y = centerY + wave + my * 13 * mouse;
        const sx = Math.max(0.46, 0.48 + front * 0.66);
        const rotation = Math.sin(theta) * -0.42 + Math.sin(t * 0.6 + index * 0.3) * 0.018;

        const shadow = header.wrappedTextColor || '#ffffff';
        const depthColor = header.wrappedSurfaceColor || '#0A84FF';
        const shadowColor = '#172033';
        const alpha = 0.28 + front * 0.72;

        ctx.save();
        ctx.translate(x, y);

        // 4 depth passes = visible extrusion without dozens of SVG filters.
        for (let layer = 4; layer >= 1; layer--) {
          const d = layer * (1.7 + intensity * 1.3);
          ctx.save();
          ctx.rotate(rotation);
          ctx.scale(sx, sx);
          ctx.globalAlpha = alpha * (0.07 + (5 - layer) * 0.025);
          ctx.fillStyle = shadowColor;
          ctx.fillText(ch, -gw * 0.5, d);
          ctx.restore();
        }

        // Colored edge.
        ctx.save();
        ctx.rotate(rotation);
        ctx.scale(sx, sx);
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = Math.max(1, 1.8 * sx);
        ctx.strokeStyle = depthColor;
        ctx.strokeText(ch, -gw * 0.5 - 1, 0);
        ctx.restore();

        // Front.
        ctx.save();
        ctx.rotate(rotation);
        ctx.scale(sx, sx);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = shadow;
        ctx.shadowColor = depthColor;
        ctx.shadowBlur = glow * 5;
        ctx.fillText(ch, -gw * 0.5, 0);
        ctx.restore();

        ctx.restore();
        cursor += gw;
      });

      if (p.active && !reduced) {
        const gx = width * (0.5 + mx * 0.2);
        const gy = height * (0.5 + my * 0.15);
        const light = ctx.createRadialGradient(gx, gy, 0, gx, gy, height * 0.5);
        light.addColorStop(0, 'rgba(255,255,255,0.10)');
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
