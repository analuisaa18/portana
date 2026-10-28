import React, { useMemo } from 'react';
import { ProjectBlock, P5Config } from '../../types/portfolio';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_P5_CONFIG } from '../../services/defaultData';

/** Executa apenas sketches de projetos salvos em iframe sandboxed, sem acesso ao DOM do portfólio. */
export const P5Block: React.FC<{ block: ProjectBlock; previewConfig?: P5Config }> = ({ block, previewConfig }) => {
  const { themeConfig } = useTheme();
  const config = {...DEFAULT_P5_CONFIG,...themeConfig.p5,...previewConfig};
  const html = useMemo(() => {
    // Serialização evita quebrar a tag <script> mesmo que o sketch contenha HTML.
    const source = JSON.stringify(block.content || '').replace(/</g, '\\u003c');
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>html,body{margin:0;width:100%;height:100%;background:#141414;color:white}canvas{max-width:100%}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.10/p5.min.js"></script>
    </head><body><script>try {(0,eval)(${source});if(typeof window.p5==='function')new window.p5();} catch(e){document.body.textContent='Erro ao executar sketch p5.js: '+e.message;}</script></body></html>`;
  },[block.content]);
  if (!config.enabled) return null;
  return <figure className="space-y-2">
    <iframe title={block.caption || 'Sketch interativo p5.js'} sandbox="allow-scripts" referrerPolicy="no-referrer" loading="lazy"
      srcDoc={html} style={{width:'100%',height:config.heightPx,border:'1px solid var(--color-border)',pointerEvents:config.pointerEnabled?'auto':'none'}} />
    {block.caption && <figcaption className="text-sm opacity-75">{block.caption}</figcaption>}
  </figure>;
};
P5
