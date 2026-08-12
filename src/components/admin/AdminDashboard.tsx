import React, { useEffect, useState } from 'react';
import { portfolioStore } from '../../services/store';
import { Project, Category } from '../../types/portfolio';
import { SupabaseStatusCard } from './SupabaseStatusCard';
import { SettingsEditor } from './SettingsEditor';
import { CategoryManager } from './CategoryManager';
import { ProjectList } from './ProjectList';
import { AppearanceEditor } from './AppearanceEditor';
import { GitHubManager } from './GitHubManager';
import { 
  FolderGit2, 
  Layers, 
  UserCheck, 
  Palette, 
  LogOut, 
  Eye, 
  FileCheck2, 
  FileClock,
  Sparkles,
  Github
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onPreviewPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onPreviewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'categories' | 'github' | 'settings' | 'appearance'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const projData = await portfolioStore.getProjects(true);
      const catData = await portfolioStore.getCategories();
      setProjects(projData);
      setCategories(catData);
    } catch (err) {
      console.error('Erro ao recarregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const publishedCount = projects.filter((p) => p.status === 'publicado').length;
  const draftCount = projects.filter((p) => p.status === 'rascunho').length;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'projects', label: 'Gerenciar Projetos', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorias', icon: <Layers className="w-4 h-4" /> },
    { id: 'github', label: 'Integração GitHub', icon: <Github className="w-4 h-4 text-[var(--color-accent)]" /> },
    { id: 'settings', label: 'Perfil & Sobre', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'appearance', label: 'Aparência & Design System', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="py-8 max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
            Painel de Controle
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mt-1">
            Gestão do Portfólio Autoral
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPreviewPublic}
            className="px-4 py-2.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Ver Portfólio Público</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Status Widget */}
      <SupabaseStatusCard />

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-1" aria-label="Abas do painel administrativo">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-text-primary)] bg-[var(--color-surface)] rounded-t-[var(--radius-md)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                <span className="text-xs font-semibold uppercase tracking-wider">Total de Projetos</span>
                <FolderGit2 className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <p className="text-3xl font-black text-[var(--color-text-primary)]">{projects.length}</p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                <span className="text-xs font-semibold uppercase tracking-wider">Publicados</span>
                <FileCheck2 className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <p className="text-3xl font-black text-[var(--color-text-primary)]">{publishedCount}</p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                <span className="text-xs font-semibold uppercase tracking-wider">Rascunhos</span>
                <FileClock className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <p className="text-3xl font-black text-[var(--color-text-primary)]">{draftCount}</p>
            </div>

            <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[var(--color-text-secondary)]">
                <span className="text-xs font-semibold uppercase tracking-wider">Categorias</span>
                <Layers className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <p className="text-3xl font-black text-[var(--color-text-primary)]">{categories.length}</p>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setActiveTab('projects')}
              className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-all text-left space-y-3 shadow-xs cursor-pointer group"
            >
              <FolderGit2 className="w-8 h-8 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Gerenciar Projetos</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Cadastre novos projetos, altere status de publicação, defina imagens de capa e monte a sequência de blocos.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('github')}
              className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all text-left space-y-3 shadow-xs cursor-pointer group"
            >
              <Github className="w-8 h-8 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Sincronizador GitHub</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Busque repositórios do GitHub em tempo real e importe seus trabalhos open-source diretamente como projetos.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-all text-left space-y-3 shadow-xs cursor-pointer group"
            >
              <Layers className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Gerenciar Categorias</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Crie e ordene categorias personalizadas para agrupar e filtrar seus trabalhos no acervo autoral.
              </p>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-all text-left space-y-3 shadow-xs cursor-pointer group"
            >
              <Palette className="w-8 h-8 text-[var(--color-success)] group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Aparência & Design Tokens</h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Personalize cores, tipografia, border-radius, grid, velocidade de movimento e tom de voz com auditoria de contraste WCAG.
              </p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <ProjectList
          projects={projects}
          categories={categories}
          onRefresh={refreshData}
        />
      )}

      {activeTab === 'github' && (
        <GitHubManager
          categories={categories}
          onRefreshProjects={refreshData}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryManager
          categories={categories}
          onRefresh={refreshData}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsEditor onSaved={refreshData} />
      )}

      {activeTab === 'appearance' && (
        <AppearanceEditor onSaved={refreshData} />
      )}
    </div>
  );
};
