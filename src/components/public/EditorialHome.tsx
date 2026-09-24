import React from 'react';
import { ArrowUpRight, Star, Mail, Instagram, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Project } from '../../types/portfolio';

const photo = (seed: string) => `https://picsum.photos/seed/${seed}/1000/760`;

interface EditorialHomeProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onNavigate: (view: string) => void;
  view?: 'home' | 'projetos';
}

export const EditorialHome: React.FC<EditorialHomeProps> = ({ projects, onSelectProject, view = 'home' }) => {
  const { settings } = useTheme();

  const cards = projects.slice(0, 4);
  const fallbackTitles = ['IDENTIDADE VISUAL', 'PROJETO GRÁFICO', 'INTERFACES', 'DESENHOS E PINTURAS'];
  const fallbackSub = ['Sistema de marca', 'Exploração gráfica', 'Experiência digital', 'Processos e experimentações'];

  const imageFor = (p: Project | undefined, i: number) => {
    const src = (p as any)?.cover_image || (p as any)?.thumbnail || (p as any)?.image_url;
    return src || photo(`portana-editorial-${i + 1}`);
  };

  const Hero = () => (
    <section className="editorial-panel editorial-panel--pink editorial-hero" aria-label="Portfólio">
      <div className="editorial-index">00 / 05</div>
      <div className="editorial-hero-copy">
        <button
          type="button"
          className="editorial-hero-title"
          aria-label="Portfólio — interação"
        >PORTFÓLIO</button>
        <p>DESIGN DE INTERFACES,<br/>PROJETOS GRÁFICOS E<br/>EXPERIÊNCIAS VISUAIS.</p>
        <div className="editorial-star-doodle">✳</div>
      </div>
      <div className="editorial-hero-paper paper-one" aria-hidden="true" />
      <div className="editorial-hero-paper paper-two" aria-hidden="true" />
      <img className="editorial-hero-photo" src={settings.profile_image || photo('portana-profile')} alt="Imagem editorial de destaque" />
      <div className="editorial-hero-scribble">✦</div>
      <div className="editorial-hero-star editorial-hero-star--one" aria-hidden="true">✳</div>
      <div className="editorial-hero-star editorial-hero-star--two" aria-hidden="true">✦</div>
    </section>
  );

  const About = () => (
    <section className="editorial-panel editorial-panel--black editorial-about" aria-label="Sobre mim">
      <div className="editorial-index">01 / 05</div>
      <h2>SOBRE<br/>MIM</h2>
      <div className="editorial-about-copy">
        <p>Olá, eu sou Ana.<br/><br/>Sou estudante e tenho interesse por design de interfaces, tipografia, fotografia e tudo que envolve comunicação visual.</p>
        <p>Gosto de transformar ideias em projetos que conectam pessoas, com soluções simples, funcionais e cheias de personalidade.</p>
      </div>
      <img src={settings.profile_image || photo('portana-about')} alt="Retrato editorial" />
      <div className="editorial-doodle">✳</div>
    </section>
  );

  const Projects = () => (
    <section className="editorial-panel editorial-panel--pink editorial-projects" aria-label="Projetos">
      <div className="editorial-index">02 / 05</div>
      <div className="editorial-page-star editorial-page-star--projects-one" aria-hidden="true">✳</div>
      <div className="editorial-page-star editorial-page-star--projects-two" aria-hidden="true">✦</div>
      <h2>PROJETOS</h2>
      <div className="editorial-project-grid">
        {[0, 1, 2, 3].map((i) => {
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
    </section>
  );

  const Principles = () => (
    <section className="editorial-panel editorial-panel--black editorial-principles" aria-label="Princípios">
      <div className="editorial-index">03 / 05</div>
      <div className="editorial-page-star editorial-page-star--principles" aria-hidden="true">✳</div>
      <h2>PRINCÍPIOS</h2>
      <div className="editorial-principles-body">
        <ul>
          <li>CRIATIVIDADE</li><li>FUNCIONALIDADE</li><li>ESTÉTICA</li><li>AUTENTICIDADE</li><li>PROCESSO</li>
        </ul>
        <div className="editorial-quote-mark">✳</div>
        <blockquote>“boas ideias<br/>também são<br/>formas de<br/>cuidado.”</blockquote>
      </div>
    </section>
  );

  const Contact = () => (
    <section className="editorial-panel editorial-panel--black editorial-contact" aria-label="Contato">
      <div className="editorial-contact-title">VAMOS<br/>CONVERSAR?</div>
      <div className="editorial-contact-links">
        {settings.email_public && <a href={`mailto:${settings.email_public}`}><Mail size={16}/> {settings.email_public}</a>}
        {settings.social_links?.[0]?.url && <a href={settings.social_links[0].url} target="_blank" rel="noreferrer"><Instagram size={16}/> {settings.social_links[0].platform}</a>}
        {settings.location && <span><MapPin size={16}/> {settings.location}</span>}
      </div>
    </section>
  );

  const FooterCard = () => (
    <section className="editorial-panel editorial-panel--pink editorial-footer-card" aria-label="Encerramento">
      <div className="editorial-brand"><Star size={16}/> ANA BOCHENECK</div>
      <div className="editorial-footer-copy">OBRIGADA<br/>POR AQUI!</div>
      <div className="editorial-footer-star-doodle">✳</div>
    </section>
  );

  // A navegação agora controla páginas independentes: a Home mostra somente
  // o portfólio, Projetos mostra somente o acervo e Sobre/Contato são páginas próprias.
  if (view === 'home') {
    return (
      <main className="editorial-home editorial-home--single">
        <div className="editorial-grid editorial-grid--single">
          <Hero />
        </div>
      </main>
    );
  }

  return (
    <main className="editorial-home editorial-home--single editorial-home--projects">
      <div className="editorial-grid editorial-grid--single">
        <Projects />
        <Principles />
        <FooterCard />
      </div>
    </main>
  );
};
