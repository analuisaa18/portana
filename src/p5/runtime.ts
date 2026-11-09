/**
 * Monta o documento HTML isolado onde cada sketch p5.js roda.
 *
 * Por que um iframe com sandbox?
 *  - um erro no código do sketch NÃO derruba o site (só aquela camada para);
 *  - o sketch não tem acesso ao login do admin, ao Supabase nem ao resto da página.
 * Como a camada fica "atrás" ou "na frente" sem bloquear cliques (pointer-events: none),
 * o site repassa os eventos de mouse, toque, rolagem e teclado para dentro dela (ver host.ts).
 */
export const P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.min.js';

export interface RuntimeContext {
  id: string;
  place: string;
}

const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function buildRuntimeHtml(code: string, ctx: RuntimeContext) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}canvas{display:block}</style>
<script>
(function () {
  var ID = ${json(ctx.id)};
  function post(msg) { msg.__p5portal = 1; msg.id = ID; try { parent.postMessage(msg, '*'); } catch (e) {} }
  window.__p5post = post;
  window.portfolio = { lugar: ${json(ctx.place)}, scroll: 0, scrollY: 0, mouseDentro: false, celular: innerWidth < 640 };

  function linha(err) {
    var m = String((err && err.stack) || '').match(/<anonymous>:(\\d+):(\\d+)/);
    return m ? Number(m[1]) : null;
  }
  window.__p5linha = linha;
  window.addEventListener('error', function (e) {
    post({ type: 'error', message: String(e.message || 'Erro no sketch'), line: linha(e.error) });
  });
  window.addEventListener('unhandledrejection', function (e) {
    post({ type: 'error', message: String((e.reason && e.reason.message) || e.reason) });
  });

  // Eventos repassados pelo site (a camada não recebe cliques diretamente).
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__p5host !== 1) return;
    try {
      if (d.type === 'pointer') {
        portfolio.mouseDentro = !!d.inside;
        window.dispatchEvent(new MouseEvent(d.kind, { clientX: d.x, clientY: d.y, button: d.button || 0, buttons: d.buttons || 0, bubbles: true, cancelable: true }));
      } else if (d.type === 'wheel') {
        window.dispatchEvent(new WheelEvent('wheel', { deltaX: d.deltaX, deltaY: d.deltaY, clientX: d.x, clientY: d.y, bubbles: true, cancelable: true }));
      } else if (d.type === 'key') {
        window.dispatchEvent(new KeyboardEvent(d.kind, { key: d.key, code: d.code, bubbles: true }));
      } else if (d.type === 'scroll') {
        portfolio.scroll = d.scroll; portfolio.scrollY = d.scrollY;
      } else if (d.type === 'visible') {
        if (typeof window.loop === 'function' && typeof window.noLoop === 'function') { d.visible ? loop() : noLoop(); }
      }
    } catch (err) {}
  });

  // Na prévia do painel o mouse age direto sobre a camada.
  document.addEventListener('mousemove', function (e) { if (e.isTrusted) portfolio.mouseDentro = true; });
  document.documentElement.addEventListener('mouseleave', function () { portfolio.mouseDentro = false; });
  document.addEventListener('touchstart', function () { portfolio.mouseDentro = true; }, { passive: true });

  // Ajusta o canvas ao tamanho da área, a menos que o sketch tenha o próprio windowResized().
  window.addEventListener('resize', function () {
    portfolio.celular = innerWidth < 640;
    if (typeof window.windowResized !== 'function' && typeof window.resizeCanvas === 'function') {
      try { resizeCanvas(innerWidth, innerHeight); } catch (e) {}
    }
  });
})();
</script>
<script src="${P5_CDN}" onerror="window.__p5post({type:'error',message:'Não foi possível carregar a biblioteca p5.js (sem internet?)'})"></script>
</head><body>
<script>
try {
  (0, eval)(${json(code)});
  window.addEventListener('load', function () { window.__p5post({ type: 'ready' }); });
} catch (e) {
  window.__p5post({ type: 'error', message: String(e.message || e), line: window.__p5linha(e) });
}
</script>
</body></html>`;
}
