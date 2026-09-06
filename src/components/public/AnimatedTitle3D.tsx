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

/**
 * Lightweight wrapped/cylindrical typography.
 * The reference effect behaves like type travelling around a 3D cylinder:
 * the glyphs become larger in front, smaller toward the sides and their
 * baseline bends with the cylinder. A few cheap offset passes create depth.
 */
export const AnimatedTitle3D: React.FC<AnimatedTitle3DProps> = ({
  line1 = 'PROJETOS &',
  line2 = 'CONCEITOS',
  surfaceColor = '#7c6dff',
  textColor = '#ffffff',
  shadowColor = '#17121b',
  intensity = 1.2,
  speed = 1,
  mouseStrength = 1.1,
  enabled = true,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const visible = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let start = performance.now();
    let dpr = 1;
    let width = 1;
    let height = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.max(280, r.width);
      height = Math.max(180, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = Math.round(width * dpr);
      const ch = Math.round(height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.tx = ((e.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 2;
      pointer.current.ty = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => { visible.current = entry.isIntersecting; },
      { threshold: 0.01 },
    );

    resize();
    observer.observe(canvas);
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!visible.current || now - last < 30) return; // ~33 fps, deliberately light.
      last = now;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dt = Math.min(50, now - (last || now));
      const p = pointer.current;
      p.x += (p.tx - p.x) * 0.11;
      p.y += (p.ty - p.y) * 0.11;

      const t = reduced ? 0 : ((now - start) / 1000) * Math.max(0.08, speed);
      const power = Math.max(0, Math.min(2.2, intensity));
      const mouse = Math.max(0, Math.min(2, mouseStrength));

      ctx.clearRect(0, 0, width, height);

      const family = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-headings')
        .trim() || 'Arial, sans-serif';
      const weight = 900;
      const baseSize = Math.max(34, Math.min(104, width > 700 ? 94 : width * 0.115));

      // Cylinder: front is at theta = 0, sides turn away from camera.
      const radius = Math.max(520, width * 1.15);
      // Keep the whole word in the front half of the cylinder so it stays readable.
      const arc = Math.min(1.35, 0.92 + power * 0.16);
      const wobble = 0.055 + power * 0.018;
      const centerX = width / 2 + p.x * width * 0.055 * mouse;
      const centerY = height / 2 + p.y * height * 0.07 * mouse;

      const drawLine = (text: string, yOffset: number, size: number) => {
        const chars = Array.from(text);
        ctx.font = `${weight} ${size}px ${family}`;
        const widths = chars.map(ch => ctx.measureText(ch).width);
        const total = widths.reduce((a, b) => a + b, 0);
        const fit = Math.min(1, (width * 0.9) / Math.max(total, 1));
        let cursor = -total * fit / 2;

        chars.forEach((ch, index) => {
          const w = widths[index] * fit;
          const u = (cursor + w / 2) / Math.max(total * fit, 1);
          const theta = u * arc + Math.sin(t * 0.75 + index * 0.15) * 0.018 * power
            + p.x * 0.10 * mouse;

          const front = Math.cos(theta);
          const side = Math.sin(theta);
          // Perspective compression toward cylinder edges.
          const scale = 0.82 + 0.18 * Math.max(0, front);
          const x = centerX + side * radius * 0.38;
          const wave = Math.sin(theta * 2.15 + t * 1.05) * height * wobble;
          const y = centerY + yOffset + wave + p.y * 9 * mouse;
          const rotation = -theta * 0.55 + Math.sin(t * 0.55 + index * 0.22) * 0.012 + p.x * 0.035 * mouse;

          // Only soften, never fully remove, the side glyphs.
          const alpha = 0.82 + 0.18 * Math.max(0, front);
          const sx = Math.max(0.72, scale * fit);

          ctx.save();
          ctx.translate(x, y);

          // 3D depth: 5 cheap passes, unlike SVG turbulence which is expensive.
          for (let layer = 5; layer >= 1; layer--) {
            const d = layer * (2.4 + power * 1.8);
            ctx.save();
            ctx.rotate(rotation);
            ctx.scale(sx, sx * (0.96 + front * 0.08));
            ctx.globalAlpha = alpha * (0.05 + (6 - layer) * 0.025);
            ctx.fillStyle = shadowColor;
            ctx.fillText(ch, -w * 0.5, layer * d * 0.42);
            ctx.restore();
          }

          // Chromatic edge echoes, inspired by the reference.
          ctx.save();
          ctx.rotate(rotation);
          ctx.scale(sx, sx);
          ctx.globalAlpha = alpha * 0.85;
          ctx.lineWidth = Math.max(1.2, 2.4 * sx);
          ctx.strokeStyle = surfaceColor;
          ctx.strokeText(ch, -w * 0.5 - 1.8, 0);
          ctx.restore();

          // Front face.
          ctx.save();
          ctx.rotate(rotation);
          ctx.scale(sx, sx * (0.96 + front * 0.08));
          ctx.globalAlpha = alpha;
          ctx.fillStyle = textColor;
          ctx.shadowColor = surfaceColor;
          ctx.shadowBlur = 2.5 + front * 3;
          ctx.fillText(ch, -w * 0.5, 0);
          ctx.restore();

          ctx.restore();
          cursor += w;
        });
      };

      if (line2) {
        drawLine(line1, -baseSize * 0.56, baseSize * 0.86);
        drawLine(line2, baseSize * 0.48, baseSize * 0.86);
      } else {
        drawLine(line1, 0, baseSize);
      }
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [enabled, line1, line2, surfaceColor, textColor, shadowColor, intensity, speed, mouseStrength]);

  if (!enabled) return null;

  return (
    <div className="animated-title-3d animated-title-3d--wrapped-gif">
      <canvas
        ref={ref}
        className="animated-title-3d-canvas"
        aria-label={`${line1} ${line2}`}
        role="img"
      />
      <span className="sr-only">{line1} {line2}</span>
    </div>
  );
};

export default AnimatedTitle3D;
