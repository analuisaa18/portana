import React, { useRef, useState } from 'react';

export const BrikTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setRotation({
      x: -y * 18,
      y: x * 22,
    });
  };

  const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <section className="brik-ticker-section" aria-label="Experimento tipográfico interativo">
      <div
        ref={containerRef}
        className="brik-ticker"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="brik-ticker-inner"
          style={{
            transform: `perspective(900px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          <img
            src="/assets/brik-ticker.png"
            alt="Experimento tipográfico 3D"
            className="brik-ticker-image"
          />
          <div className="brik-ticker-overlay" aria-hidden="true">
            <span>EXPERIMENTO</span>
            <span>TIPOGRAFIA</span>
            <span>INTERAÇÃO</span>
          </div>
        </div>
        <div className="brik-ticker-shadow" aria-hidden="true" />
      </div>
    </section>
  );
};
