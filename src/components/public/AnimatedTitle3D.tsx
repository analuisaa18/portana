import React, { useEffect, useRef } from 'react';

interface AnimatedTitle3DProps {
  line1?: string;
  line2?: string;
}

export const AnimatedTitle3D: React.FC<AnimatedTitle3DProps> = ({
  line1 = 'PROJETOS &',
  line2 = 'CONCEITOS',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const letters = lettersRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      mouseX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      mouseY =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      targetX = mouseX;
      targetY = mouseY;
    };

    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    const animate = () => {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      const time = performance.now() * 0.001;

      letters.forEach((letter, index) => {
        if (!letter) return;

        const wave =
          Math.sin(time * 2.2 + index * 0.55) * 7;

        const wave2 =
          Math.cos(time * 1.7 + index * 0.35) * 4;

        const mouseInfluence =
          mouseX * (index % 2 === 0 ? 10 : -10);

        const depth =
          Math.sin(index * 0.8 + time) * 10 +
          mouseX * 22;

        const rotation =
          Math.sin(time * 1.8 + index * 0.5) * 2.5 +
          mouseX * (index % 2 ? 4 : -4);

        const rotationX =
          mouseY * -8 +
          Math.cos(time + index * 0.4) * 2;

        const scale =
          1 +
          Math.sin(time * 1.5 + index * 0.6) * 0.025;

        letter.style.transform = `
          translate3d(
            ${mouseInfluence}px,
            ${wave + mouseY * 10}px,
            ${depth}px
          )
          rotateX(${rotationX}deg)
          rotateY(${mouseX * 12 + wave2}deg)
          rotateZ(${rotation}deg)
          scale(${scale})
        `;

        letter.style.textShadow = `
          ${depth * 0.35}px
          ${depth * 0.18}px
          0px
          rgba(0,0,0,0.18)
        `;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      container.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      container.removeEventListener(
        'pointerleave',
        handlePointerLeave
      );
    };
  }, []);

  const allLetters = [
    ...line1.split('').map((character, index) => ({
      character,
      index,
      line: 0,
    })),
    ...line2.split('').map((character, index) => ({
      character,
      index: index + line1.length,
      line: 1,
    })),
  ];

  return (
    <div
      ref={containerRef}
      className="animated-title-3d"
      aria-label={`${line1} ${line2}`}
    >
      <div className="animated-title-3d-line">
        {allLetters
          .filter((item) => item.line === 0)
          .map((item) => (
            <span
              key={`line1-${item.index}`}
              ref={(element) => {
                if (element) {
                  lettersRef.current[item.index] = element;
                }
              }}
              className="animated-title-3d-letter"
              aria-hidden="true"
            >
              {item.character === ' ' ? '\u00A0' : item.character}
            </span>
          ))}
      </div>

      <div className="animated-title-3d-line animated-title-3d-line-accent">
        {allLetters
          .filter((item) => item.line === 1)
          .map((item) => (
            <span
              key={`line2-${item.index}`}
              ref={(element) => {
                if (element) {
                  lettersRef.current[item.index] = element;
                }
              }}
              className="animated-title-3d-letter"
              aria-hidden="true"
            >
              {item.character === ' ' ? '\u00A0' : item.character}
            </span>
          ))}
      </div>
    </div>
  );
};
