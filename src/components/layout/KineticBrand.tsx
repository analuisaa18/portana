import React from 'react';

interface KineticBrandProps {
  text: string;
  subtitle?: string;
}

export default function KineticBrand({ text, subtitle }: KineticBrandProps) {
  return (
    <div className="select-none">
      <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none hover:tracking-normal transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-300 to-neutral-600">
        {text}
      </h1>
      {subtitle && (
        <p className="text-xs md:text-sm font-mono tracking-widest text-neutral-500 uppercase mt-4">
          {subtitle}
        </p>
      )}
    </div>
  );
}
