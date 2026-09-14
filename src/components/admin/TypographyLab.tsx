import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { ThemeTypographyLab } from '../../types/portfolio';

interface TypographyLabProps {
  value: ThemeTypographyLab;
  onChange: (value: ThemeTypographyLab) => void;
  previewText: string;
  fontFamily: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const TypographyLab: React.FC<TypographyLabProps> = ({ value, onChange, previewText, fontFamily }) => {
  const [hovered, setHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const letters = useMemo(() => Array.from(value.text || previewText || '3D TICKER'), [value.text, previewText]);

  useEffect(() => {
    if (!value.text) onChange({ ...value, text: previewText || '3D TICKER' });
    // Intencionalmente só inicializa o texto vazio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value.autoRotate || value.speed <= 0) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      setTime((now - started) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value.autoRotate, value.speed]);

  const update = (patch: Partial<ThemeTypographyLab>) => onChange({ ...value, ...patch });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    setPointer({ x, y });
  };

  const reset = () => onChange({
    text: previewText || '3D TICKER',
    speed: 1,
    depth: 28,
    perspective: 900,
    curvature: 18,
    spacing: 4,
    rotateX: -12,
    rotateY: 0,
    rotateZ: 0,
    mouseStrength: 0.7,
    autoRotate: true,
  });

  return (
    <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" /> Laboratório de Tipografia
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Teste efeitos cinéticos e 3D antes de aplicar ao portfólio. Inspirado na ideia de 3D Ticker.
          </p>
        </div>
        <button type="button" onClick={reset} className="px-3 py-2 text-xs font-semibold border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Resetar
        </button>
      </div>

      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] min-h-[230px] flex items-center justify-center"
        style={{
          perspective: `${clamp(value.perspective, 300, 2000)}px`,
          background: `radial-gradient(circle at ${50 + pointer.x * 20}% ${50 + pointer.y * 20}%, var(--color-surface), var(--color-background))`,
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => { setHovered(false); setPointer({ x: 0, y: 0 }); }}
        onPointerMove={handlePointerMove}
      >
        <div
          className="flex items-center justify-center whitespace-nowrap select-none"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${value.rotateX + pointer.y * value.mouseStrength * -10}deg) rotateY(${value.rotateY + pointer.x * value.mouseStrength * 14}deg) rotateZ(${value.rotateZ}deg)`,
            transition: hovered ? 'transform 120ms ease-out' : 'transform 500ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {letters.map((letter, index) => {
            const angle = letters.length > 1 ? ((index / (letters.length - 1)) - 0.5) * value.curvature : 0;
            const wave = value.autoRotate ? Math.sin(time * value.speed * 2 + index * 0.45) * 2 : 0;
            return (
              <span
                key={`${letter}-${index}`}
                className="inline-block font-black uppercase text-[clamp(2.2rem,7vw,5.5rem)] leading-none"
                style={{
                  fontFamily,
                  marginInline: `${value.spacing / 2}px`,
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(${Math.sin(index * 0.8) * value.depth + wave * value.depth * 0.08}px) rotateY(${angle}deg)`,
                  color: index % 2 === 0 ? 'var(--color-text-primary)' : 'var(--color-accent)',
                  textShadow: `${value.depth * 0.12}px ${value.depth * 0.08}px 0 color-mix(in srgb, var(--color-accent) 28%, transparent)`,
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            );
          })}
        </div>
        <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.25em] opacity-50">Preview interativa</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <label className="space-y-1"><span className="font-semibold">Texto</span><input value={value.text} onChange={e => update({ text: e.target.value.slice(0, 40) })} className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Velocidade: {value.speed.toFixed(1)}x</span><input type="range" min="0" max="3" step="0.1" value={value.speed} onChange={e => update({ speed: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Profundidade: {value.depth}px</span><input type="range" min="0" max="100" step="1" value={value.depth} onChange={e => update({ depth: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Perspectiva: {value.perspective}px</span><input type="range" min="300" max="2000" step="50" value={value.perspective} onChange={e => update({ perspective: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Curvatura: {value.curvature}°</span><input type="range" min="-45" max="45" step="1" value={value.curvature} onChange={e => update({ curvature: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Espaçamento: {value.spacing}px</span><input type="range" min="-8" max="30" step="1" value={value.spacing} onChange={e => update({ spacing: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Rotação X: {value.rotateX}°</span><input type="range" min="-60" max="60" step="1" value={value.rotateX} onChange={e => update({ rotateX: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Rotação Y: {value.rotateY}°</span><input type="range" min="-60" max="60" step="1" value={value.rotateY} onChange={e => update({ rotateY: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Rotação Z: {value.rotateZ}°</span><input type="range" min="-45" max="45" step="1" value={value.rotateZ} onChange={e => update({ rotateZ: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
        <label className="space-y-1"><span className="font-semibold">Mouse: {value.mouseStrength.toFixed(1)}x</span><input type="range" min="0" max="2" step="0.1" value={value.mouseStrength} onChange={e => update({ mouseStrength: Number(e.target.value) })} className="w-full accent-[var(--color-accent)]" /></label>
      </div>
      <label className="inline-flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={value.autoRotate} onChange={e => update({ autoRotate: e.target.checked })} /> Movimento automático</label>
    </div>
  );
};
