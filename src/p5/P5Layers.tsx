import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { P5Layer, P5Place } from '../types/portfolio';
import { DEFAULT_INTERACTIONS } from '../services/defaultData';
import { buildPresetCode } from './presets';
import { buildRuntimeHtml } from './runtime';
import { registerFrame } from './host';

export const layerCode = (layer: P5Layer) =>
  layer.mode === 'code' && layer.code.trim() ? layer.code : buildPresetCode(layer.preset, layer.params);

const useMedia = (query: string) => {
  const get = () => typeof window !== 'undefined' && window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState<boolean>(Boolean(get()));
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setMatches(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return matches;
};

/** Uma camada no site: iframe isolado, transparente, que não bloqueia cliques. */
const LayerFrame: React.FC<{ layer: P5Layer; place: P5Place }> = ({ layer, place }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => buildRuntimeHtml(layerCode(layer), { id: layer.id, place }), [layer, place]);

  useEffect(() => {
    if (!ref.current) return;
    return registerFrame(ref.current);
  }, [html]);

  return (
    <iframe
      ref={ref}
      key={html}
      className={`p5-layer p5-layer--${layer.depth}`}
      title={`Camada interativa: ${layer.name}`}
      aria-hidden="true"
      tabIndex={-1}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcDoc={html}
      style={{ opacity: layer.opacity }}
    />
  );
};

/** Coloque <P5Layers place="..."/> dentro de qualquer área com position:relative. */
export const P5Layers: React.FC<{ place: P5Place }> = ({ place }) => {
  const { themeConfig } = useTheme();
  const config = themeConfig.interactions || DEFAULT_INTERACTIONS;
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)');
  const isMobile = useMedia('(max-width: 640px)');

  if (config.respectReducedMotion && reduceMotion) return null;
  const layers = config.layers.filter((layer) =>
    layer.enabled && layer.places.includes(place) && (layer.showOnMobile || !isMobile));
  if (!layers.length) return null;

  return <>{layers.map((layer) => <LayerFrame key={layer.id} layer={layer} place={place} />)}</>;
};
