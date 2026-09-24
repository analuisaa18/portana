import React from 'react';
import { ArrowUpRight, Menu, Star, Mail, Instagram, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Project } from '../../types/portfolio';

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/1000/760`;

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({ projects, onSelectProject, onNavigate }) => {
  const { settings } = useTheme();
  const accent = '#E388A9';
  const black = '#090909';
  const pink = '#E388A9';

  const cards = projects.slice(0, 4);
  const fallbackTitles = ['IDENTIDADE VISUAL', 'PROJETO GRÁFICO', 'INTERFACES', 'DESENHOS E PINTURAS'];
  const fallbackSub = ['Sistema de marca', 'Exploração gráfica', 'Experiência digital', 'Processos e experimentações'];

  const imageFor = (p: Project | undefined, i: number) => {
    const src = (p as any)?.cover_image || (p as any)?.thumbnail || (p as any)?.image_url;
    return src || photo(`portana-editorial-${i + 1}`);
  };

  return (
    <main className="editorial-home">
      <section className="editorial-grid">
        {/* HERO */}
        <article className="editorial-panel editorial-panel--pink editorial-hero">
          <div className="editorial-mini-nav">
            <button onClick={() => onNavigate('projetos')} className="editorial-brand"><Star size={17} strokeWidth={2.2} /> ANA BOCHENECK</button>
            <nav>
              <button onClick={() => onNavigate('sobre')}>SOBRE</button>
              <button onClick={() => onNavigate('projetos')}>PROJETOS</button>
              <button onClick={() => onNavigate('contato')}>CONTATO</button>
              <button aria-label="Menu"><Menu size={19}/></button>
            </nav>
          </div>
          <div className="editorial-hero-copy">
            <h1>PORTFÓLIO</h1>
            <p>DESIGN DE INTERFACES,<br/>PROJETOS GRÁFICOS E<br/>EXPERIÊNCIAS VISUAIS.</p>
            <div className="editorial-star-doodle">✳</div>
          </div>
          <img className="editorial-hero-photo" src={settings.profile_image || photo('portana-profile')} alt="Imagem editorial" />
          <div className="editorial-hero-scribble">✦</div>
        </article>

        {/* ABOUT */}
        <article className="editorial-panel editorial-panel--black editorial-about">
          <div className="editorial-index">01 / 04</div>
          <h2>SOBRE<br/>MIM</h2>
          <p>Olá, eu sou Ana.<br/><br/>Sou estudante e tenho interesse por design de interfaces, tipografia, fotografia e tudo que envolve comunicação visual.</p>
          <p>Gosto de transformar ideias em projetos que conectam pessoas, com soluções simples, funcionais e cheias de personalidade.</p>
          <img src={settings.profile_image || photo('portana-about')} alt="Retrato editorial" />
          <div className="editorial-doodle">✳</div>
        </article>

        {/* PROJECTS */}
        <article className="editorial-panel editorial-panel--pink editorial-projects">
          <div className="editorial-index">02 / 04</div>
          <h2>PROJETOS</h2>
          <div className="editorial-project-grid">
            {[0,1,2,3].map((i) => {
              const p = cards[i];
              return (
                <button key={p?.id || i} className="editorial-project-card" onClick={() => p && onSelectProject(p.slug)}>
                  <img src={imageFor(p, i)} alt={p?.title || fallbackTitles[i]} />
                  <strong>{p?.title || fallbackTitles[i]}</strong>
                  <span>{p?.description?.slice(0, 48) || fallbackSub[i]}</span>
                  <ArrowUpRight size={14}/>
                </button>
              );
            })}
          </div>
        </article>

        {/* PRINCIPLES */}
        <article className="editorial-panel editorial-panel--black editorial-principles">
          <div className="editorial-index">03 / 04</div>
          <h2>PRINCÍPIOS</h2>
          <div className="editorial-principles-body">
            <ul>
              <li>CRIATIVIDADE</li><li>FUNCIONALIDADE</li><li>ESTÉTICA</li><li>AUTENTICIDADE</li><li>PROCESSO</li>
            </ul>
            <div className="editorial-quote-mark">✳</div>
            <blockquote>“boas ideias<br/>também são<br/>formas de<br/>cuidado.”</blockquote>
          </div>
        </article>

        {/* CONTACT */}
        <article className="editorial-panel editorial-panel--black editorial-contact">
          <div className="editorial-contact-title">VAMOS<br/>CONVERSAR?</div>
          <div className="editorial-contact-links">
            {settings.email_public && <a href={`mailto:${settings.email_public}`}><Mail size={16}/> {settings.email_public}</a>}
            {settings.social_links?.[0]?.url && <a href={settings.social_links[0].url} target="_blank" rel="noreferrer"><Instagram size={16}/> {settings.social_links[0].platform}</a>}
            {settings.location && <span><MapPin size={16}/> {settings.location}</span>}
          </div>
        </article>

        {/* FOOTER */}
        <article className="editorial-panel editorial-panel--pink editorial-footer-card">
          <div className="editorial-brand"><Star size={16}/> ANA BOCHENECK</div>
          <div className="editorial-footer-copy">OBRIGADA<br/>POR AQUI!</div>
          <div className="editorial-star-doodle">✳</div>
        </article>
      </section>
      <footer className="editorial-footer">© {new Date().getFullYear()} {settings.portfolio_name || 'Ana Bochenek'} — Portfólio Autoral</footer>
    </main>
  );
};
