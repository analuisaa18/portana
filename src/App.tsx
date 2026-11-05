import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { AboutSection } from './components/public/AboutSection';
import { ProjectDetail } from './components/public/ProjectDetail';
import { ContactSection } from './components/public/ContactSection';
import { EditorialHome } from './components/public/EditorialHome';
import { ProjectsEditorial } from './components/public/ProjectsEditorial';
import { portfolioStore } from './services/store';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Project, Category } from './types/portfolio';
import { LoadingState } from './components/common/LoadingState';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ADMIN_BEFORE_LEAVE_EVENT = 'portfolio:admin-before-leave';

// O painel só é baixado quando alguém abre o /admin — visitantes carregam um site mais leve.
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));

type Route = { view: string; slug: string | null };
const PUBLIC_VIEWS = ['home', 'sobre', 'projetos', 'contato', 'admin'];

// Rotas por hash (#/projetos, #/projeto/meu-slug). Funcionam em qualquer hospedagem
// estática sem configurar redirects, e permitem compartilhar o link de um projeto.
// Hashes que não começam com "#/" (ex.: tokens de login do Supabase) são ignorados.
const parseHash = (hash: string): Route => {
  if (!hash.startsWith('#/')) return { view: 'home', slug: null };
  const [view, ...rest] = hash.slice(2).split('/');
  if (view === 'projeto' && rest[0]) return { view: 'projeto-detail', slug: decodeURIComponent(rest.join('/')) };
  return { view: PUBLIC_VIEWS.includes(view) ? view : 'home', slug: null };
};

const toHash = ({ view, slug }: Route) => {
  if (view === 'projeto-detail' && slug) return `#/projeto/${encodeURIComponent(slug)}`;
  return view === 'home' ? '#/' : `#/${view}`;
};

export function PortfolioApp() {
  const { settings } = useTheme();
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const currentView = route.view;
  const selectedSlug = route.slug;

  const loadPublicData = async () => {
    setLoading(true);
    try {
      const [projData, catData] = await Promise.all([
        portfolioStore.getProjects(false),
        portfolioStore.getCategories(),
      ]);
      setProjects(projData);
      setCategories(catData);
    } catch (err) {
      console.error('Erro ao carregar acervo público:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();
    // Quando algo é salvo no painel, o site público recarrega projetos/categorias sozinho.
    const eventName = portfolioStore.getDataChangedEventName();
    const onChanged = (event: Event) => {
      const kind = (event as CustomEvent).detail?.kind;
      if (kind !== 'settings') void loadPublicData();
    };
    window.addEventListener(eventName, onChanged);
    return () => window.removeEventListener(eventName, onChanged);
  }, []);

  // Botões voltar/avançar do navegador.
  useEffect(() => {
    const onHashChange = () => {
      if (!window.location.hash.startsWith('#/') && window.location.hash) return;
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Título da aba do navegador com o nome do portfólio.
  useEffect(() => {
    if (currentView !== 'projeto-detail' && settings.portfolio_name) document.title = settings.portfolio_name;
  }, [settings.portfolio_name, currentView]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsAdminAuthenticated(false);
      setAuthLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsAdminAuthenticated(Boolean(data.session));
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(Boolean(session));
      setAuthLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (view: string, slug?: string) => {
    // Saindo do painel com edições pendentes: pergunta antes.
    if (route.view === 'admin' && view !== 'admin' &&
      !window.dispatchEvent(new Event(ADMIN_BEFORE_LEAVE_EVENT, { cancelable: true }))) return;
    const next: Route = { view, slug: slug || null };
    setRoute(next);
    const hash = toHash(next);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    handleNavigate('home');
  };

  const isAdmin = currentView === 'admin';
  const isDetail = currentView === 'projeto-detail' && Boolean(selectedSlug);
  const headerView = isDetail ? 'projetos' : currentView;

  return (
    <div className={isAdmin ? 'admin-shell' : 'reference-site'}>
      {!isAdmin && <Header currentView={headerView} onNavigate={handleNavigate} />}

      <main id="main-content" className={isAdmin ? 'admin-main' : 'reference-main'} tabIndex={-1}>
        {loading && !isAdmin && !isDetail ? (
          <LoadingState message="Carregando portfólio..." minHeight="min-h-screen" />
        ) : (
          <>
            {currentView === 'home' && (
              <EditorialHome
                projects={projects}
                onSelectProject={(slug) => handleNavigate('projeto-detail', slug)}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === 'sobre' && <AboutSection onNavigateContact={() => handleNavigate('contato')} />}
            {currentView === 'projetos' && (
              <ProjectsEditorial projects={projects} onSelectProject={(slug) => handleNavigate('projeto-detail', slug)} />
            )}
            {isDetail && selectedSlug && <ProjectDetail slug={selectedSlug} onBack={() => handleNavigate('projetos')} />}
            {currentView === 'contato' && <ContactSection />}
            {isAdmin && (
              <ErrorBoundary area="o painel administrativo" onReset={() => handleNavigate('home')} resetLabel="Voltar ao site">
                <Suspense fallback={<LoadingState message="Abrindo painel administrativo..." minHeight="min-h-screen" />}>
                  {authLoading ? <LoadingState message="Verificando acesso administrativo..." minHeight="min-h-screen" /> :
                    !isAdminAuthenticated ? <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} onBack={() => handleNavigate('home')} /> :
                    <AdminDashboard onLogout={handleAdminLogout} onPreviewPublic={() => handleNavigate('home')} />}
                </Suspense>
              </ErrorBoundary>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return <ThemeProvider><PortfolioApp /></ThemeProvider>;
}
