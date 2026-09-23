import React from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v:number,min:number,max:number) => Math.min(max, Math.max(min, v));

/** Lightweight recreation of the reference field: oversized cropped circles moving behind the header. */
export const HeaderCircleField: React.FC<Props> = ({ header, pointer }) => {
  if (header.circleFieldEnabled === false) return null;

  const bg = header.circleFieldBackground || '#E7E7CE';
  const configuredCircle = header.circleFieldColor;
  // Keep older saved themes compatible: the previous neon-yellow default now follows the portfolio accent.
  const circle = !configuredCircle || configuredCircle.toUpperCase() === '#F2FF00' ? 'var(--color-accent)' : configuredCircle;
  const opacity = clamp(header.circleFieldOpacity ?? 1, 0, 1);
  const size = clamp(header.circleFieldSize ?? 190, 90, 420);
  const motion = clamp(header.circleFieldMotion ?? 0.7, 0, 2);
  const pointerStrength = clamp(header.circleFieldMouse ?? 0.55, 0, 2);
  // As bolinhas ficam paradas enquanto o cursor está fora do Header.
  // Quando o mouse entra/move, cada bolinha recebe um deslocamento diferente,
  // criando a sensação de profundidade/paralaxe sem animação automática.
  const circleMotion = (c: { d: number }, index: number) => {
    // Cada bolinha tem um vetor próprio: elas não se deslocam como um bloco.
    // O mouse apenas ativa o movimento; a direção, força e eixo variam por círculo.
    const px = pointer.active ? pointer.x : 0;
    const py = pointer.active ? pointer.y : 0;
    const depth = 0.62 + (index % 3) * 0.2;
    const angle = c.d * 1.7 + index * 0.85;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const crossX = Math.sin(angle * 0.8);
    const crossY = Math.cos(angle * 0.9);
    const strength = pointerStrength * (0.72 + (index % 4) * 0.16);

    const x = (px * dirX * 34 + py * crossX * 10) * strength * depth;
    const y = (py * dirY * 25 + px * crossY * 8) * strength * depth;
    return { x, y };
  };


  const circles = [
    { left:'-8%', top:'-82%', s:1.02, d:0.0 },
    { left:'30%', top:'-105%', s:1.18, d:1.4 },
    { left:'91%', top:'18%', s:1.05, d:2.6 },
    { left:'7%', top:'70%', s:1.12, d:3.5 },
    { left:'43%', top:'82%', s:1.0, d:4.6 },
    { left:'78%', top:'68%', s:1.08, d:5.5 },
  ];

  return (
    <div
      className="header-circle-field"
      aria-hidden="true"
      style={{
        backgroundColor: bg,
        opacity,
        ['--circle-size' as any]: `${size}px`,
        ['--circle-color' as any]: circle,
      } as React.CSSProperties}
    >
      {circles.map((c, i) => (
        <span
          key={i}
          className="header-circle-field__circle"
          style={{
            left: c.left,
            top: c.top,
            ['--circle-scale' as any]: c.s,
            ['--circle-delay' as any]: `${c.d}s`,
            ['--circle-x' as any]: `${circleMotion(c, i).x}px`,
            ['--circle-y' as any]: `${circleMotion(c, i).y}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default HeaderCircleField;
