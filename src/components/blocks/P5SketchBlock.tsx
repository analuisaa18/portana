import React, { useMemo } from 'react';
import { ProjectBlock } from '../../types/portfolio';

interface P5SketchBlockProps {
  block: ProjectBlock;
}

const DEFAULT_P5_CODE = `function setup() {
  createCanvas(200, 200, WEBGL);
  debugMode();
  describe('A cube you can look around by clicking and dragging');
}
function draw() {
  background(220);

  orbitControl();
  box(50);
}`;

/**
 * Runs the saved p5.js sketch inside a sandboxed iframe so the sketch cannot
 * access the portfolio application's DOM, storage, or React runtime.
 */
export const P5SketchBlock: React.FC<P5SketchBlockProps> = ({ block }) => {
  const code = block.content?.trim() || DEFAULT_P5_CODE;

  const srcDoc = useMemo(() => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
    body { min-height: 100%; display: grid; place-items: center; }
    canvas { display: block; max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.min.js"></script>
  <script>
    try {
      ${code.replace(/<\\/script/gi, '<\\\\/script')}
    } catch (error) {
      document.body.innerHTML = '<pre style="font:12px monospace;padding:16px;white-space:pre-wrap">Erro no sketch p5.js: ' + String(error) + '</pre>';
    }
  </script>
</body>
</html>`, [code]);

  return (
    <figure className="my-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
          Sketch p5.js interativo
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-accent)]">
          clique + arraste
        </span>
      </div>
      <div className="min-h-[260px] p-5 flex items-center justify-center bg-[var(--color-bg)]">
        <iframe
          title={block.caption || 'Sketch p5.js interativo'}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="w-full max-w-[520px] h-[320px] border-0 rounded-[var(--radius-md)]"
          loading="lazy"
        />
      </div>
      {block.caption && (
        <figcaption className="px-5 py-3 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
