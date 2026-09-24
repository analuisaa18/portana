import React from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props {
  header: ThemeHeader;
  pointer: { x: number; y: number; active: boolean };
}

const clamp = (v:number,min:number,max:number) => Math.min(max, Math.max(min, v));

/**
 * Editorial graphic field used inside the navigation capsule.
 * The old circles are intentionally replaced by the same visual language
 * used throughout the portfolio: floating stars/doodles + translucent blocks.
 */
export const HeaderCircleField: React.FC<Props> = ({ header, pointer }) => {
  if (header.circleFieldEnabled === false) return null;

  const opacity = clamp(header.circleFieldOpacity ?? 1, 0, 1);
  const pointerStrength = clamp(header.circleFieldMouse ?? 0.55, 0, 2);
  const px = pointer.active ? pointer.x : 0;
  const py = pointer.active ? pointer.y : 0;

  const stars = [
    { left: '7%', top: '18%', size: 31, delay: '0s', duration: '6.8s', dx: -16, dy: -10, rotate: -12 },
    { left: '28%', top: '68%', size: 20, delay: '-2.2s', duration: '7.8s', dx: 12, dy: -14, rotate: 8 },
    { left: '51%', top: '10%', size: 25, delay: '-4.1s', duration: '8.6s', dx: -10, dy: 12, rotate: -8 },
    { left: '78%', top: '70%', size: 28, delay: '-1.4s', duration: '7.2s', dx: 14, dy: 8, rotate: 13 },
    { left: '93%', top: '20%', size: 18, delay: '-3.4s', duration: '9s', dx: -10, dy: -12, rotate: -6 },
  ];

  const blocks = [
    { left: '17%', top: '8%', width: 92, height: 36, rotate: -9, opacity: .16, delay: '-1s', duration: '10s', dx: 10, dy: 8 },
    { left: '63%', top: '58%', width: 112, height: 42, rotate: 8, opacity: .12, delay: '-5s', duration: '12s', dx: -12, dy: -8 },
    { left: '86%', top: '8%', width: 76, height: 30, rotate: -15, opacity: .14, delay: '-7s', duration: '11s', dx: 8, dy: 10 },
  ];

  return (
    <div
      className="header-graphic-field"
      aria-hidden="true"
      style={{ opacity }}
    >
      {blocks.map((b, i) => {
        const x = px * b.dx * pointerStrength;
        const y = py * b.dy * pointerStrength;
        return (
          <span
            key={`block-${i}`}
            className="header-graphic-block"
            style={{
              left: b.left,
              top: b.top,
              width: `${b.width}px`,
              height: `${b.height}px`,
              opacity: b.opacity,
              ['--block-rotate' as any]: `${b.rotate}deg`,
              ['--block-delay' as any]: b.delay,
              ['--block-duration' as any]: b.duration,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${b.rotate}deg)`,
            } as React.CSSProperties}
          />
        );
      })}

      {stars.map((s, i) => {
        const x = px * s.dx * pointerStrength;
        const y = py * s.dy * pointerStrength;
        return (
          <span
            key={`star-${i}`}
            className="header-graphic-star"
            style={{
              left: s.left,
              top: s.top,
              fontSize: `${s.size}px`,
              ['--star-delay' as any]: s.delay,
              ['--star-duration' as any]: s.duration,
              ['--star-rotate' as any]: `${s.rotate}deg`,
              transform: `translate3d(${x}px, ${y}px, 0) rotate(${s.rotate}deg)`,
            } as React.CSSProperties}
          >✦</span>
        );
      })}
    </div>
  );
};

export default HeaderCircleField;
