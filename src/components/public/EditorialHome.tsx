import React from 'react';
import { BrikTicker } from './BrikTicker';
import ProjectsGrid from './ProjectsGrid';
import KineticBrand from '../layout/KineticBrand';

export default function EditorialHome() {
  return (
    <section className="px-4 md:px-8 max-w-7xl mx-auto py-12">
      {/* Título Principal Editorial */}
      <div className="mb-12">
        <KineticBrand text="ATHENAS" subtitle="CREATIVE DEVELOPER & UI DESIGNER" />
        <p className="mt-6 text-xl text-neutral-400 max-w-2xl leading-relaxed">
          Especializada em criar experiências digitais memoráveis através de código limpo, design intuitivo e interações fluidas.
        </p>
      </div>

      {/* Banner Editorial Imersivo */}
      <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden mb-16 border border-neutral-800">
        <picture>
          <source 
            media="(max-width: 768px)" 
            srcSet="/src/assets/home-editorial-mobile.jpg" 
          />
          <img 
            src="/src/assets/home-editorial-experiment.jpg" 
            alt="Editorial Experiment Showcase" 
            className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700 ease-out"
          />
        </picture>
        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs tracking-widest uppercase">
          ✦ Visual & Creative Dev Portfolio
        </div>
      </div>

      {/* Ticker Infinito */}
      <BrikTicker items={['REACT', 'TYPESCRIPT', 'TAILWIND CSS', 'THREE.JS', 'UI/UX DESIGN', 'NEXT.JS', 'WEBGL']} />

      {/* Grade de Projetos */}
      <div className="mt-20">
        <h2 className="text-3xl font-extrabold mb-8 tracking-tight uppercase">Projetos Selecionados</h2>
        <ProjectsGrid />
      </div>
    </section>
  );
}
