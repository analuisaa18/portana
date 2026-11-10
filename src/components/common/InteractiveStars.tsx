import React, { memo, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './InteractiveStars.css';

/**
 * Estrelas interativas do portfólio.
 *
 *  • place="navbar" → estrelas dentro da cápsula do menu, com EFEITO MAGNÉTICO: quando o mouse entra
 *    na navbar, cada estrela é puxada na direção do cursor com força/velocidade próprias (por
 *    distância, "massa" e mola individuais) e volta suavemente ao lugar quando o mouse sai.
 *  • place="home" | "sobre" | "projetos" | "contato" | "projeto" → estrelas de cada página,
 *    flutuando, girando e brilhando, com uma reação bem leve ao cursor.
 *
 * Um único laço requestAnimationFrame compartilhado anima todas as estrelas (só transform/opacity,
 * sem re-render do React), pausa fora da tela / aba oculta e respeita "reduzir movimento".
 * Nenhuma estrela captura cliques (pointer-events:none).
 */

export type StarPlace = 'navbar' | 'home' | 'sobre' | 'projetos' | 'contato' | 'projeto';
type StarColor = 'white' | 'gray' | 'pink' | 'black';

interface StarSpec {
  /** Centro da estrela, em % da largura do container. */
  x: number;
  /** Centro da estrela no eixo Y: % do topo (padrão), px do topo ('px') ou % a partir da base ('bpct'). */
  y: number;
  yu?: 'pct' | 'px' | 'bpct';
  size: number;
  color: StarColor;
  /** Rotação inicial (graus), velocidade de giro (graus/s) e variante de forma. */
  rot: number;
  spin: number;
  shape: 0 | 1;
  /** Flutuação: amplitude (px), velocidade (rad/s) e fase. */
  amp: number;
  speed: number;
  phase: number;
  /** Brilho: opacidade base, profundidade da variação e velocidade (rad/s). */
  opacity: number;
  twinkle: number;
  twinkleSpeed: number;
  /** Magnetismo: quanto da distância até o cursor a estrela percorre (0–1), rigidez e amortecimento da mola. */
  pull: number;
  stiffness: number;
  damping: number;
}

/* ---------- Composição (posicionamento observado no vídeo de referência) ---------- */

const s = (x: number, y: number, size: number, color: StarColor, o: Partial<StarSpec> = {}): StarSpec => ({
  x, y, size, color,
  rot: 0, spin: 5, shape: 0,
  amp: 5, speed: 0.9, phase: 0,
  opacity: 1, twinkle: 0.25, twinkleSpeed: 1.6,
  pull: 0.6, stiffness: 0.06, damping: 0.84,
  ...o,
});

const LAYOUTS: Record<StarPlace, StarSpec[]> = {
  // Cápsula do menu: 5 estrelas grandes + 4 pequenas, distribuídas pela extensão toda.
  navbar: [
    s(9.3, 36, 34, 'gray',  { rot: 8,   spin: 6,   shape: 0, amp: 5, speed: 0.75, phase: 0.4, opacity: 0.78, pull: 0.55, stiffness: 0.045, damping: 0.86 }),
    s(29.7, 74, 23, 'pink', { rot: -14, spin: -7,  shape: 1, amp: 4, speed: 0.95, phase: 2.1, opacity: 0.95, pull: 0.85, stiffness: 0.075, damping: 0.82 }),
    s(53.4, 18, 28, 'white',{ rot: 20,  spin: 9,   shape: 1, amp: 4, speed: 0.85, phase: 3.3, opacity: 1,    pull: 0.7,  stiffness: 0.06,  damping: 0.84 }),
    s(81.3, 80, 32, 'pink', { rot: 5,   spin: -5,  shape: 0, amp: 6, speed: 0.7,  phase: 5.0, opacity: 0.95, pull: 0.6,  stiffness: 0.05,  damping: 0.86 }),
    s(96.1, 28, 22, 'white',{ rot: -10, spin: 8,   shape: 0, amp: 4, speed: 1.0,  phase: 1.2, opacity: 0.95, pull: 0.4,  stiffness: 0.07,  damping: 0.83 }),
    s(38.2, 26, 10, 'pink', { rot: 12,  spin: 12,  shape: 0, amp: 3, speed: 1.1,  phase: 4.2, opacity: 0.55, twinkle: 0.45, pull: 0.95, stiffness: 0.09, damping: 0.8 }),
    s(50.4, 82, 9,  'gray', { rot: -6,  spin: -10, shape: 1, amp: 3, speed: 1.2,  phase: 0.9, opacity: 0.7,  twinkle: 0.4,  pull: 0.9,  stiffness: 0.085, damping: 0.8 }),
    s(71.8, 28, 11, 'pink', { rot: 16,  spin: 10,  shape: 1, amp: 3, speed: 1.0,  phase: 2.8, opacity: 0.55, twinkle: 0.45, pull: 0.9,  stiffness: 0.08, damping: 0.81 }),
    s(89.2, 76, 9,  'gray', { rot: -12, spin: -9,  shape: 0, amp: 3, speed: 1.15, phase: 3.9, opacity: 0.75, twinkle: 0.4,  pull: 0.8,  stiffness: 0.08, damping: 0.82 }),
  ],

  home: [
    s(38.5, 47, 36, 'black', { rot: -8, spin: 4, shape: 0, amp: 5, speed: 0.55, phase: 0.8, opacity: 0.55, twinkle: 0.12 }),
    s(7.6, 14, 30, 'black', { yu: 'bpct', rot: 12, spin: -5, shape: 1, amp: 7, speed: 0.6, phase: 2.2 }),
    s(6.4, 10.5, 24, 'white', { yu: 'bpct', rot: -16, spin: 6, shape: 0, amp: 6, speed: 0.7, phase: 4.0 }),
    s(80, 4, 18, 'pink',     { yu: 'bpct', rot: 6, spin: 7, shape: 1, amp: 4, speed: 0.8, phase: 1.5, opacity: 0.8 }),
  ],

  sobre: [
    s(10, 33, 30, 'pink',    { rot: 10, spin: 4, shape: 0, amp: 5, speed: 0.55, phase: 1.1 }),
    s(57, 74, 44, 'pink',    { rot: -6, spin: -3, shape: 1, amp: 8, speed: 0.45, phase: 3.0, opacity: 0.42, twinkle: 0.15 }),
    s(89, 84, 36, 'pink',    { rot: 14, spin: 5, shape: 0, amp: 7, speed: 0.6, phase: 4.6 }),
  ],

  projetos: [
    s(4, 52, 26, 'black',    { rot: 8, spin: 4, shape: 1, amp: 5, speed: 0.6, phase: 0.3 }),
    s(96, 7, 34, 'white',    { yu: 'bpct', rot: -12, spin: -5, shape: 0, amp: 6, speed: 0.55, phase: 2.5 }),
  ],

  contato: [
    s(14, 200, 40, 'white',  { yu: 'px', rot: -10, spin: 4, shape: 0, amp: 6, speed: 0.55, phase: 0.6 }),
    s(88, 7, 34, 'white',    { yu: 'bpct', rot: 12, spin: -5, shape: 1, amp: 6, speed: 0.6, phase: 3.4 }),
  ],

  projeto: [
    s(4, 30, 30, 'pink',     { rot: 6, spin: 4, shape: 1, amp: 5, speed: 0.6, phase: 1.9 }),
  ],
};

/* ---------- Forma: burst de 8 pontas com raios desiguais (como no vídeo) ---------- */

const buildBurst = (outer: number[], inner: number[]) => {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 - 90) * (Math.PI / 180);
    const b = (i * 45 - 67.5) * (Math.PI / 180);
    pts.push(`${(Math.cos(a) * 50 * outer[i]).toFixed(2)} ${(Math.sin(a) * 50 * outer[i]).toFixed(2)}`);
    pts.push(`${(Math.cos(b) * 50 * inner[i]).toFixed(2)} ${(Math.sin(b) * 50 * inner[i]).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
};

const SHAPES = [
  buildBurst([1, 0.74, 0.92, 0.72, 1, 0.76, 0.9, 0.74], [0.3, 0.34, 0.28, 0.33, 0.3, 0.35, 0.29, 0.33]),
  buildBurst([0.94, 0.8, 1, 0.7, 0.92, 0.82, 0.98, 0.72], [0.32, 0.27, 0.34, 0.29, 0.31, 0.28, 0.35, 0.3]),
];

/* ---------- Motor compartilhado ---------- */

interface StarRuntime {
  el: HTMLElement;
  spec: StarSpec;
  ox: number; oy: number; vx: number; vy: number;
  /** 0–1: quanto o cursor está influenciando a estrela agora (dá escala/brilho extra). */
  heat: number;
}

interface Field {
  el: HTMLElement;
  mode: 'navbar' | 'page';
  stars: StarRuntime[];
  visible: boolean;
}

const fields = new Set<Field>();
const pointer = { x: -9999, y: -9999, active: false, touch: false };
let raf = 0;
let lastT = 0;
let lastScrollY = 0;
let scrollVel = 0;
let listening = false;
let hoverCapable = true;

const PARAMS = {
  navbar: { radius: 300, maxPull: 150, falloff: 1.15 },
  page: { radius: 170, maxPull: 22, falloff: 1.4 },
} as const;

const resolveBase = (spec: StarSpec, w: number, h: number) => ({
  bx: (spec.x / 100) * w,
  by: spec.yu === 'px' ? spec.y : spec.yu === 'bpct' ? h - (spec.y / 100) * h : (spec.y / 100) * h,
});

const tick = (now: number) => {
  raf = requestAnimationFrame(tick);
  const dt = Math.min(48, now - (lastT || now));
  lastT = now;
  const f = dt / 16.667;
  const t = now / 1000;

  const sy = window.scrollY;
  scrollVel += ((sy - lastScrollY) - scrollVel) * Math.min(1, 0.18 * f);
  lastScrollY = sy;

  // 1) leituras de layout (uma por campo) — 2) escritas de transform, sem alternar.
  const active: Array<{ field: Field; w: number; h: number; px: number; py: number; inside: boolean; ghost: boolean }> = [];
  fields.forEach((field) => {
    if (!field.visible) return;
    const r = field.el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    let px = pointer.x - r.left;
    let py = pointer.y - r.top;
    let inside = pointer.active && px >= 0 && py >= 0 && px <= r.width && py <= r.height;
    let ghost = false;
    // Celular (sem hover): a navbar ganha um "ímã" invisível que passeia devagar, e o toque também atrai.
    if (field.mode === 'navbar' && !hoverCapable && !inside) {
      px = r.width * (0.5 + 0.44 * Math.sin(t * 0.32)) ;
      py = r.height * (0.5 + 0.28 * Math.sin(t * 0.53 + 1));
      inside = true;
      ghost = true;
    }
    active.push({ field, w: r.width, h: r.height, px, py, inside, ghost });
  });

  for (const { field, w, h, px, py, inside, ghost } of active) {
    const P = PARAMS[field.mode];
    for (const st of field.stars) {
      const sp = st.spec;
      const fx = Math.sin(t * sp.speed + sp.phase) * sp.amp;
      const fy = Math.cos(t * sp.speed * 0.8 + sp.phase * 1.3) * sp.amp * 0.85;
      const { bx, by } = resolveBase(sp, w, h);
      const cx = bx + fx + st.ox;
      const cy = by + fy + st.oy;

      let tx = 0;
      let ty = 0;
      let heat = 0;

      if (inside) {
        const dx = px - (bx + fx);
        const dy = py - (by + fy);
        const d = Math.hypot(dx, dy);
        const reach = P.radius * (0.75 + sp.pull * 0.5);
        if (d < reach && d > 0.5) {
          heat = Math.pow(1 - d / reach, P.falloff);
          let gain = sp.pull * heat * (ghost ? 0.7 : 1);
          let mx = dx * gain;
          let my = dy * gain;
          const m = Math.hypot(mx, my);
          const cap = P.maxPull * (0.55 + sp.pull * 0.45);
          if (m > cap) { mx = (mx / m) * cap; my = (my / m) * cap; }
          tx = mx; ty = my;
        }
      } else if (field.mode === 'page' && !hoverCapable) {
        // Celular: as estrelas das páginas se deslocam com a rolagem (paralaxe), sem hover.
        ty = Math.max(-18, Math.min(18, -scrollVel * (0.6 + sp.pull)));
      }

      // Mola individual (rigidez/amortecimento próprios): movimento orgânico, sem corte seco.
      st.vx = (st.vx + (tx - st.ox) * sp.stiffness * f) * Math.pow(sp.damping, f);
      st.vy = (st.vy + (ty - st.oy) * sp.stiffness * f) * Math.pow(sp.damping, f);
      st.ox += st.vx * f;
      st.oy += st.vy * f;
      st.heat += (heat - st.heat) * Math.min(1, 0.12 * f);

      const rot = sp.rot + t * sp.spin + st.ox * 0.35 + st.heat * 25;
      const scale = 1 + 0.08 * Math.sin(t * sp.speed * 1.3 + sp.phase) + st.heat * 0.28;
      const op = Math.min(1, sp.opacity * (1 - sp.twinkle * 0.5 + sp.twinkle * 0.5 * Math.sin(t * sp.twinkleSpeed + sp.phase * 2)) + st.heat * 0.25);

      st.el.style.transform = `translate3d(${(cx - bx).toFixed(2)}px, ${(cy - by).toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      st.el.style.opacity = op.toFixed(3);
    }
  }
};

const onMove = (e: PointerEvent) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.touch = e.pointerType === 'touch';
  pointer.active = true;
};
const onDown = (e: PointerEvent) => onMove(e);
const onUp = (e: PointerEvent) => { if (e.pointerType === 'touch') pointer.active = false; };
const onLeave = () => { pointer.active = false; };

const startListening = () => {
  if (listening) return;
  listening = true;
  hoverCapable = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });
  window.addEventListener('blur', onLeave);
  document.documentElement.addEventListener('mouseleave', onLeave);
  document.addEventListener('visibilitychange', syncLoop);
  lastScrollY = window.scrollY;
};

const stopListening = () => {
  if (!listening) return;
  listening = false;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerdown', onDown);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onUp);
  window.removeEventListener('blur', onLeave);
  document.documentElement.removeEventListener('mouseleave', onLeave);
  document.removeEventListener('visibilitychange', syncLoop);
};

function syncLoop() {
  const shouldRun = fields.size > 0 && !document.hidden;
  if (shouldRun && !raf) { lastT = 0; raf = requestAnimationFrame(tick); }
  if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
}

const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        fields.forEach((field) => { if (field.el === entry.target) field.visible = entry.isIntersecting; });
      });
    }, { rootMargin: '120px' })
  : null;

const register = (field: Field) => {
  fields.add(field);
  io?.observe(field.el);
  startListening();
  syncLoop();
  return () => {
    fields.delete(field);
    io?.unobserve(field.el);
    if (!fields.size) stopListening();
    syncLoop();
  };
};

/* ---------- Componente ---------- */

const useStill = () => {
  const { themeConfig } = useTheme();
  const interactions = themeConfig.interactions;
  const stars = interactions?.animateStars !== false;
  const respect = interactions?.respectReducedMotion !== false;
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return !stars || (respect && Boolean(reduce));
};

const InteractiveStarsBase: React.FC<{ place: StarPlace }> = ({ place }) => {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const specs = LAYOUTS[place];
  const mode: Field['mode'] = place === 'navbar' ? 'navbar' : 'page';

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    const stars: StarRuntime[] = Array.from(el.children).map((child, i) => ({
      el: child as HTMLElement, spec: specs[i], ox: 0, oy: 0, vx: 0, vy: 0, heat: 0,
    }));
    return register({ el, mode, stars, visible: true });
  }, [still, specs, mode]);

  return (
    <div ref={ref} className={`istars istars--${mode}`} aria-hidden="true" data-stars-place={place}>
      {specs.map((sp, i) => {
        const top = sp.yu === 'px' ? `${sp.y}px` : sp.yu === 'bpct' ? `${100 - sp.y}%` : `${sp.y}%`;
        return (
          <span
            key={i}
            className={`istar istar--${sp.color}`}
            style={{
              left: `${sp.x}%`,
              top,
              ['--s' as string]: `${sp.size}px`,
              opacity: sp.opacity,
              transform: `rotate(${sp.rot}deg)`,
            } as React.CSSProperties}
          >
            <svg viewBox="-50 -50 100 100" focusable="false"><path d={SHAPES[sp.shape]} /></svg>
          </span>
        );
      })}
    </div>
  );
};

/** Memoizado: a navbar (montada uma única vez) nunca reinicia a animação ao navegar/interagir. */
export const InteractiveStars = memo(InteractiveStarsBase);
export default InteractiveStars;
