import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { AboutSection } from './components/public/AboutSection';
import { ProjectDetail } from './components/public/ProjectDetail';
import { ContactSection } from './components/public/ContactSection';
import { EditorialHome } from './components/public/EditorialHome';
import { ProjectsEditorial } from './components/public/ProjectsEditorial';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { portfolioStore } from './services/store';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Project, Category } from './types/portfolio';
import { LoadingState } from './components/common/LoadingState';

export function PortfolioApp() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { loadPublicData(); }, []);

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === 'home') {
        setCurrentView('home');
        setSelectedSlug(null);
      } else if (hash === 'admin') {
        setCurrentView('admin');
        setSelectedSlug(null);
      } else if (hash.startsWith('projeto/')) {
        const slug = hash.replace('projeto/', '');
        setCurrentView('projeto-detail');
        setSelectedSlug(slug);
      } else if (['sobre', 'projetos', 'contato'].includes(hash)) {
        setCurrentView(hash);
        setSelectedSlug(null);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

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
    setCurrentView(view);
    setSelectedSlug(slug || null);
    if (view === 'projeto-detail' && slug) {
      window.location.hash = `#projeto/${slug}`;
    } else {
      window.location.hash = `#${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setCurrentView('home');
  };

  const isAdmin = currentView === 'admin';
  const isDetail = currentView === 'projeto-detail' || Boolean(selectedSlug);

  return (
    <div className={isAdmin ? 'admin-shell' : 'reference-site'}>
      {!isDetail && <Header currentView={currentView} onNavigate={handleNavigate} />}

      <main id="main-content" className={isAdmin ? 'admin-main pt-28' : 'reference-main'} tabIndex={-1}>
        {loading && !isAdmin ? (
          <LoadingState message="Carregando portfólio..." />
        ) : (
          <>
            {currentView === 'home' && !selectedSlug && (
              <EditorialHome
                projects={projects}
                onSelectProject={(slug) => handleNavigate('projeto-detail', slug)}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === 'sobre' && <AboutSection onNavigateContact={() => handleNavigate('contato')} />}
            {currentView === 'projetos' && !selectedSlug && (
              <ProjectsEditorial projects={projects} onSelectProject={(slug) => handleNavigate('projeto-detail', slug)} />
            )}
            {isDetail && selectedSlug && <ProjectDetail slug={selectedSlug} onBack={() => handleNavigate('projetos')} />}
            {currentView === 'contato' && <ContactSection />}
            {currentView === 'admin' && (
              authLoading ? <LoadingState message="Verificando acesso administrativo..." /> :
              !isAdminAuthenticated ? <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} /> :
              <AdminDashboard onLogout={handleAdminLogout} onPreviewPublic={() => handleNavigate('projetos')} />
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
