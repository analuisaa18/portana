import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AboutSection } from './components/public/AboutSection';
import { ProjectsGrid } from './components/public/ProjectsGrid';
import { ProjectDetail } from './components/public/ProjectDetail';
import { ContactSection } from './components/public/ContactSection';
import { EditorialHome } from './components/public/EditorialHome';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { portfolioStore } from './services/store';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Project, Category } from './types/portfolio';
import { LoadingState } from './components/common/LoadingState';

export function PortfolioApp() {
  const [currentView, setCurrentView] = useState<string>('projetos');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPublicData = async () => {
    setLoading(true);
    try {
      const projData = await portfolioStore.getProjects(false);
      const catData = await portfolioStore.getCategories();
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
    if (slug) {
      setSelectedSlug(slug);
    } else {
      setSelectedSlug(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsAdminAuthenticated(false);
    setCurrentView('projetos');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        {loading ? (
          <LoadingState message="Carregando portfólio autoral..." />
        ) : (
          <>
            {/* View: Sobre */}
            {currentView === 'sobre' && (
              <AboutSection onNavigateContact={() => handleNavigate('contato')} />
            )}

            {/* View: Projetos Gallery */}
            {currentView === 'projetos' && !selectedSlug && (
              <EditorialHome
                projects={projects}
                onSelectProject={(slug) => handleNavigate('projeto-detail', slug)}
                onNavigate={handleNavigate}
              />
            )}

            {/* View: Individual Project Details */}
            {(currentView === 'projeto-detail' || selectedSlug) && selectedSlug && (
              <ProjectDetail
                slug={selectedSlug}
                onBack={() => handleNavigate('projetos')}
              />
            )}

            {/* View: Contato */}
            {currentView === 'contato' && <ContactSection />}

            {/* View: Admin */}
            {currentView === 'admin' && (
              <>
                {authLoading ? (
                  <LoadingState message="Verificando acesso administrativo..." />
                ) : !isAdminAuthenticated ? (
                  <AdminLogin
                    onLoginSuccess={() => setIsAdminAuthenticated(true)}
                  />
                ) : (
                  <AdminDashboard
                    onLogout={handleAdminLogout}
                    onPreviewPublic={() => handleNavigate('projetos')}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioApp />
    </ThemeProvider>
  );
}
