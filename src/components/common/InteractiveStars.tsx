import React, { memo, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './InteractiveStars.css';

/**
 * Estrelas interativas do portfólio.
 *
 *  • place="navbar" → estrelas dentro da cápsula do menu, com EFEITO MAGNÉTICO: quando o mouse entra
 *    na navbar, cada estrela é puxada na direção do cursor com força/velocidade próprias (por
 *    distância, "massa" e mola individuais) e volta suavemente ao lugar quando o mouse sai.
 *  • place="home" | "sobre" | "projetos" | "contato" | "projeto" → estrelas de cada página,
 *    maiores (pequenas, médias e de destaque), só com animação própria: flutuam, giram e brilham.
 *    NÃO reagem ao cursor nem à rolagem — o magnetismo é exclusivo da navbar.
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

  // Páginas: tamanhos ampliados (seguindo o vídeo), com estrelas pequenas, médias e de destaque.
  home: [
    s(38.5, 47, 64, 'black', { rot: -8, spin: 4, shape: 0, amp: 7, speed: 0.55, phase: 0.8, opacity: 0.55, twinkle: 0.12 }),
    s(7.6, 14, 84, 'black', { yu: 'bpct', rot: 12, spin: -5, shape: 1, amp: 9, speed: 0.6, phase: 2.2 }),
    s(6.4, 10.5, 44, 'white', { yu: 'bpct', rot: -16, spin: 6, shape: 0, amp: 7, speed: 0.7, phase: 4.0 }),
    s(80, 4, 40, 'pink',     { yu: 'bpct', rot: 6, spin: 7, shape: 1, amp: 6, speed: 0.8, phase: 1.5, opacity: 0.8 }),
  ],

  sobre: [
    s(10, 33, 52, 'pink',    { rot: 10, spin: 4, shape: 0, amp: 7, speed: 0.55, phase: 1.1 }),
    s(57, 74, 92, 'pink',    { rot: -6, spin: -3, shape: 1, amp: 10, speed: 0.45, phase: 3.0, opacity: 0.42, twinkle: 0.15 }),
    s(89, 84, 68, 'pink',    { rot: 14, spin: 5, shape: 0, amp: 9, speed: 0.6, phase: 4.6 }),
  ],

  projetos: [
    s(4, 52, 58, 'black',    { rot: 8, spin: 4, shape: 1, amp: 7, speed: 0.6, phase: 0.3 }),
    s(96, 7, 80, 'white',    { yu: 'bpct', rot: -12, spin: -5, shape: 0, amp: 9, speed: 0.55, phase: 2.5 }),
    s(95, 30, 34, 'black',   { rot: 18, spin: 6, shape: 0, amp: 5, speed: 0.75, phase: 4.1, opacity: 0.85, twinkle: 0.3 }),
  ],

  contato: [
    s(14, 200, 72, 'white',  { yu: 'px', rot: -10, spin: 4, shape: 0, amp: 8, speed: 0.55, phase: 0.6 }),
    s(88, 7, 60, 'white',    { yu: 'bpct', rot: 12, spin: -5, shape: 1, amp: 8, speed: 0.6, phase: 3.4 }),
    s(90, 150, 32, 'pink',   { yu: 'px', rot: 4, spin: 7, shape: 1, amp: 5, speed: 0.8, phase: 5.2, opacity: 0.85, twinkle: 0.3 }),
  ],

  projeto: [
    s(4, 30, 64, 'pink',     { rot: 6, spin: 4, shape: 1, amp: 8, speed: 0.6, phase: 1.9 }),
    s(96, 62, 34, 'pink',    { rot: -10, spin: -6, shape: 0, amp: 5, speed: 0.75, phase: 3.6, opacity: 0.85, twinkle: 0.3 }),
  ],
};

/* ---------- Celular: só a POSIÇÃO muda ----------
   Mesmas estrelas (mesma ordem, tamanho, cor, animação e lógica); no celular (≤ 640px)
   apenas o centro de cada uma é levado para áreas livres da composição, longe de
   fotos, títulos e textos. A navbar não entra aqui: ela não muda. */

const MOBILE_QUERY = '(max-width: 640px)';
type StarPos = Pick<StarSpec, 'x' | 'y' | 'yu'>;

const MOBILE_POSITIONS: Partial<Record<StarPlace, StarPos[]>> = {
  home: [
    { x: 12, y: 152, yu: 'px' },
    { x: 84, y: 7, yu: 'bpct' },
    { x: 66, y: 5, yu: 'bpct' },
    { x: 92, y: 640, yu: 'px' },
  ],
  projetos: [
    { x: 88, y: 175, yu: 'px' },
    { x: 88, y: 4, yu: 'bpct' },
    { x: 94, y: 46, yu: 'pct' },
  ],
  sobre: [
    { x: 70, y: 168, yu: 'px' },
    { x: 80, y: 13, yu: 'bpct' },
    { x: 90, y: 26, yu: 'bpct' },
  ],
  contato: [
    { x: 9, y: 170, yu: 'px' },
    { x: 92, y: 520, yu: 'px' },
    { x: 94, y: 380, yu: 'px' },
  ],
};

const subscribeMobile = (cb: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const useIsMobile = () =>
  useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

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
let listening = false;
let hoverCapable = true;

/** Magnetismo: existe SOMENTE para a navbar. As estrelas das páginas nunca leem o cursor. */
const NAVBAR_MAGNET = { radius: 300, maxPull: 150, falloff: 1.15 } as const;

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

  // 1) leituras de layout (uma por campo) — 2) escritas de transform, sem alternar.
  const active: Array<{ field: Field; w: number; h: number; px: number; py: number; inside: boolean; ghost: boolean }> = [];
  fields.forEach((field) => {
    if (!field.visible) return;
    const r = field.el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const isNavbar = field.mode === 'navbar';
    let px = pointer.x - r.left;
    let py = pointer.y - r.top;
    // Só a navbar pode ser influenciada pelo cursor; nas páginas "inside" é sempre falso.
    let inside = isNavbar && pointer.active && px >= 0 && py >= 0 && px <= r.width && py <= r.height;
    let ghost = false;
    // Celular (sem hover): a navbar ganha um "ímã" invisível que passeia devagar, e o toque também atrai.
    if (isNavbar && !hoverCapable && !inside) {
      px = r.width * (0.5 + 0.44 * Math.sin(t * 0.32)) ;
      py = r.height * (0.5 + 0.28 * Math.sin(t * 0.53 + 1));
      inside = true;
      ghost = true;
    }
    active.push({ field, w: r.width, h: r.height, px, py, inside, ghost });
  });

  for (const { field, w, h, px, py, inside, ghost } of active) {
    const P = NAVBAR_MAGNET;
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

      if (inside && field.mode === 'navbar') {
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

/* ---------- Estrelas nunca sobre conteúdo (só a POSIÇÃO muda) ----------
   Os textos das páginas vêm do admin e mudam de tamanho; posições fixas acabariam caindo
   sobre títulos, parágrafos, fotos, botões ou cards. Depois que a página monta (e sempre que
   ela muda de tamanho), cada estrela da página é conferida: se o espaço que ela ocupa —
   somando a flutuação — encosta em algum conteúdo, ela é levada ao ponto livre mais próximo
   do lugar original. Tamanho, cor, forma e animação continuam iguais. A navbar não entra aqui. */

const CONTENT_SELECTOR = [
  'h1', 'h2', 'h3', 'p', 'button', 'a', 'img', 'picture', 'figure', 'input', 'textarea', 'label',
  '.ref-about__visual', '.ref-contact__card', '.ref-project-card', '.ref-detail__cover', '.ref-detail__chip',
].join(',');

type Box = { l: number; t: number; r: number; b: number };

const collectObstacles = (section: HTMLElement): Box[] => {
  const s = section.getBoundingClientRect();
  const boxes: Box[] = [];
  section.querySelectorAll<HTMLElement>(CONTENT_SELECTOR).forEach((node) => {
    if (node.closest('.istars, .p5-layer, .ref-star')) return;
    const r = node.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    boxes.push({ l: r.left - s.left - 6, t: r.top - s.top - 6, r: r.right - s.left + 6, b: r.bottom - s.top + 6 });
  });
  // a navbar fica por cima das páginas: as estrelas da página também não entram nela
  const header = document.querySelector<HTMLElement>('.ref-header');
  if (header) {
    const r = header.getBoundingClientRect();
    boxes.push({ l: r.left - s.left - 8, t: r.top - s.top - 8, r: r.right - s.left + 8, b: r.bottom - s.top + 8 });
  }
  return boxes;
};

const hitsAny = (c: Box, boxes: Box[]) => boxes.some((o) => c.l < o.r && c.r > o.l && c.t < o.b && c.b > o.t);

const placeAwayFromContent = (section: HTMLElement, starEls: HTMLElement[], margins: number[]) => {
  const W = section.clientWidth;
  const H = section.clientHeight;
  if (!W || !H) return;
  // volta todas ao lugar original antes de medir
  starEls.forEach((el) => {
    if (el.dataset.baseLeft === undefined) {
      el.dataset.baseLeft = el.style.left; el.dataset.baseTop = el.style.top;
      el.dataset.baseRight = el.style.right; el.dataset.baseBottom = el.style.bottom;
    }
    el.style.left = el.dataset.baseLeft || ''; el.style.top = el.dataset.baseTop || '';
    el.style.right = el.dataset.baseRight || ''; el.style.bottom = el.dataset.baseBottom || '';
    el.style.visibility = '';
  });
  const obstacles = collectObstacles(section);
  const placed: Box[] = [];
  const sectionRect = section.getBoundingClientRect();

  starEls.forEach((el, i) => {
    const size = Math.max(el.offsetWidth, el.offsetHeight);
    if (!size) return;
    // centro atual (sem a animação), a partir da caixa de layout
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const half = size / 2;
    const cx0 = el.offsetParent === section ? el.offsetLeft + half : rect.left - sectionRect.left + rect.width / 2;
    const cy0 = el.offsetParent === section ? el.offsetTop + half : rect.top - sectionRect.top + rect.height / 2;
    const reach = half + margins[i];
    const boxAt = (x: number, y: number): Box => ({ l: x - reach, t: y - reach, r: x + reach, b: y + reach });
    const fits = (x: number, y: number) => {
      const b = boxAt(x, y);
      // pode sair um pouco pela borda da página (fica recortada, como uma colagem), nunca sobre conteúdo
      const bleed = reach * 0.5;
      return b.l >= -bleed && b.t >= -bleed && b.r <= W + bleed && b.b <= H + bleed && !hitsAny(b, obstacles) && !hitsAny(b, placed);
    };
    let best: [number, number] | null = fits(cx0, cy0) ? [cx0, cy0] : null;
    for (let radius = 10; !best && radius < Math.max(W, H); radius += 10) {
      const steps = Math.max(12, Math.round(radius / 8));
      for (let k = 0; k < steps && !best; k++) {
        const a = (k / steps) * Math.PI * 2;
        const x = cx0 + Math.cos(a) * radius;
        const y = cy0 + Math.sin(a) * radius;
        if (fits(x, y)) best = [x, y];
      }
    }
    if (!best) { el.style.visibility = 'hidden'; return; }
    placed.push(boxAt(best[0], best[1]));
    if (Math.abs(best[0] - cx0) < 0.5 && Math.abs(best[1] - cy0) < 0.5) return;
    // posiciona pelo centro: as estrelas da página usam margin negativa de meio tamanho
    const usesCenter = cs.marginLeft.startsWith('-');
    el.style.right = 'auto'; el.style.bottom = 'auto';
    el.style.left = `${(usesCenter ? best[0] : best[0] - half).toFixed(1)}px`;
    el.style.top = `${(usesCenter ? best[1] : best[1] - half).toFixed(1)}px`;
  });
};

const useStarsAvoidContent = (container: React.RefObject<HTMLDivElement>, enabled: boolean, specs: StarSpec[]) => {
  useEffect(() => {
    const box = container.current;
    const section = box?.parentElement;
    if (!enabled || !box || !section) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const istars = Array.from(box.children) as HTMLElement[];
        // as estrelas ✦ de texto da própria página seguem a mesma regra
        const glyphs: HTMLElement[] = Array.from(section.querySelectorAll<HTMLElement>(":scope > .ref-star"));
        const els: HTMLElement[] = [...istars, ...glyphs];
        const margins = [...istars.map((_, i) => (specs[i]?.amp ?? 6) + 6), ...glyphs.map(() => 12)];
        placeAwayFromContent(section, els, margins);
      });
    };
    run();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(run) : null;
    ro?.observe(section);
    section.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', run, { once: true }); });
    document.fonts?.ready.then(run).catch(() => undefined);
    const late = window.setTimeout(run, 900);
    return () => { cancelAnimationFrame(frame); ro?.disconnect(); window.clearTimeout(late); };
  }, [container, enabled, specs]);
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
  const mobile = useIsMobile();
  const specs = useMemo(() => {
    const base = LAYOUTS[place];
    const pos = mobile ? MOBILE_POSITIONS[place] : undefined;
    return pos && pos.length === base.length ? base.map((sp, i) => ({ ...sp, ...pos[i] })) : base;
  }, [place, mobile]);
  const mode: Field['mode'] = place === 'navbar' ? 'navbar' : 'page';

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    const stars: StarRuntime[] = Array.from(el.children).map((child, i) => ({
      el: child as HTMLElement, spec: specs[i], ox: 0, oy: 0, vx: 0, vy: 0, heat: 0,
    }));
    return register({ el, mode, stars, visible: true });
  }, [still, specs, mode]);

  useStarsAvoidContent(ref, mode === 'page', specs);

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
