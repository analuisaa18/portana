/**
 * Repassa as interações da página para as camadas p5.js.
 * As camadas ficam com pointer-events:none (o site continua clicável), então mouse, toque,
 * clique, duplo clique, roda do mouse, teclado e rolagem são enviados por postMessage.
 */
type Frame = HTMLIFrameElement;

const frames = new Set<Frame>();
let listening = false;
let pendingMove: PointerEvent | null = null;
let rafId = 0;

const send = (frame: Frame, msg: Record<string, unknown>) => {
  try { frame.contentWindow?.postMessage({ ...msg, __p5host: 1 }, '*'); } catch { /* camada já removida */ }
};

const local = (frame: Frame, clientX: number, clientY: number) => {
  const r = frame.getBoundingClientRect();
  const x = clientX - r.left;
  const y = clientY - r.top;
  return { x, y, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
};

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
};

const pointer = (kind: string, e: MouseEvent, onlyInside = false) => {
  frames.forEach((frame) => {
    const p = local(frame, e.clientX, e.clientY);
    if (onlyInside && !p.inside) return;
    send(frame, { type: 'pointer', kind, ...p, button: e.button, buttons: e.buttons });
  });
};

const flushMove = () => {
  rafId = 0;
  if (pendingMove) pointer('mousemove', pendingMove);
  pendingMove = null;
};

const sendScroll = () => {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  frames.forEach((frame) => send(frame, { type: 'scroll', scroll: Math.min(1, window.scrollY / max), scrollY: window.scrollY }));
};

const handlers: Array<[string, EventListener, AddEventListenerOptions?]> = [
  ['pointermove', ((e: PointerEvent) => { pendingMove = e; if (!rafId) rafId = requestAnimationFrame(flushMove); }) as EventListener, { passive: true }],
  ['pointerdown', ((e: PointerEvent) => pointer('mousedown', e, true)) as EventListener, { passive: true }],
  ['pointerup', ((e: PointerEvent) => pointer('mouseup', e)) as EventListener, { passive: true }],
  ['click', ((e: MouseEvent) => pointer('click', e, true)) as EventListener, { passive: true }],
  ['dblclick', ((e: MouseEvent) => pointer('dblclick', e, true)) as EventListener, { passive: true }],
  ['wheel', ((e: WheelEvent) => frames.forEach((frame) => {
    const p = local(frame, e.clientX, e.clientY);
    if (p.inside) send(frame, { type: 'wheel', deltaX: e.deltaX, deltaY: e.deltaY, x: p.x, y: p.y });
  })) as EventListener, { passive: true }],
  ['keydown', ((e: KeyboardEvent) => { if (!isTyping()) frames.forEach((f) => send(f, { type: 'key', kind: 'keydown', key: e.key, code: e.code })); }) as EventListener],
  ['keyup', ((e: KeyboardEvent) => { if (!isTyping()) frames.forEach((f) => send(f, { type: 'key', kind: 'keyup', key: e.key, code: e.code })); }) as EventListener],
  ['scroll', (() => sendScroll()) as EventListener, { passive: true }],
];

const onLeave = () => frames.forEach((frame) => send(frame, { type: 'pointer', kind: 'mousemove', x: -9999, y: -9999, inside: false }));
const onVisibility = () => frames.forEach((frame) => send(frame, { type: 'visible', visible: !document.hidden }));

const startListening = () => {
  if (listening) return;
  listening = true;
  handlers.forEach(([name, fn, opts]) => window.addEventListener(name, fn, opts));
  document.documentElement.addEventListener('mouseleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);
};

const stopListening = () => {
  if (!listening) return;
  listening = false;
  handlers.forEach(([name, fn, opts]) => window.removeEventListener(name, fn, opts));
  document.documentElement.removeEventListener('mouseleave', onLeave);
  document.removeEventListener('visibilitychange', onVisibility);
};

/** Pausa a camada quando ela sai da tela (economiza bateria e CPU). */
const observer = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries) => entries.forEach((entry) =>
      send(entry.target as Frame, { type: 'visible', visible: entry.isIntersecting && !document.hidden })))
  : null;

export function registerFrame(frame: Frame) {
  frames.add(frame);
  observer?.observe(frame);
  startListening();
  // estado inicial de rolagem quando o sketch termina de carregar
  frame.addEventListener('load', () => setTimeout(sendScroll, 50), { once: true });
  return () => {
    frames.delete(frame);
    observer?.unobserve(frame);
    if (frames.size === 0) stopListening();
  };
}
