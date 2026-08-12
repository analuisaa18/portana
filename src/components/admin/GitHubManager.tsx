import React, { useState, useEffect } from 'react';
import { githubService, GitHubUser, GitHubRepo } from '../../services/github';
import { portfolioStore } from '../../services/store';
import { Category, Project, ProjectBlock } from '../../types/portfolio';
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  ExternalLink, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  RefreshCw,
  FolderPlus,
  Sparkles,
  Code2,
  Users
} from 'lucide-react';

interface GitHubManagerProps {
  categories: Category[];
  onRefreshProjects: () => void;
}

export const GitHubManager: React.FC<GitHubManagerProps> = ({
  categories,
  onRefreshProjects,
}) => {
  const [username, setUsername] = useState('anabochenek');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedRepoNames, setImportedRepoNames] = useState<Set<string>>(new Set());

  // Load existing projects to check which repos might already be imported
  useEffect(() => {
    const checkImported = async () => {
      const existingProjects = await portfolioStore.getProjects(true);
      const names = new Set(existingProjects.map((p) => p.slug.toLowerCase()));
      setImportedRepoNames(names);
      
      // Load saved github username from settings
      const settings = await portfolioStore.getSettings();
      if (settings.github_username) {
        setUsername(settings.github_username);
        fetchGitHubData(settings.github_username);
      } else {
        fetchGitHubData('anabochenek');
      }
    };
    checkImported();
  }, []);

  const fetchGitHubData = async (targetUser: string) => {
    if (!targetUser.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const profile = await githubService.getUserProfile(targetUser);
      setUserProfile(profile);

      const repoList = await githubService.getUserRepos(targetUser);
      setRepos(repoList);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comunicar com a API do GitHub.');
      setUserProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGitHubData(username);
  };

  const toggleSelectRepo = (id: number) => {
    setSelectedRepoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllRepos = () => {
    if (selectedRepoIds.length === filteredRepos.length) {
      setSelectedRepoIds([]);
    } else {
      setSelectedRepoIds(filteredRepos.map((r) => r.id));
    }
  };

  const handleSetMainUser = async () => {
    if (!userProfile) return;
    try {
      await portfolioStore.updateSettings({
        github_username: userProfile.login,
      });
      setSuccessMsg(`Usuário @${userProfile.login} definido como conta principal do portfólio!`);
    } catch (err) {
      setErrorMsg('Erro ao atualizar configurações.');
    }
  };

  const handleImportSingle = async (repo: GitHubRepo) => {
    await importReposToPortfolio([repo]);
  };

  const handleImportSelected = async () => {
    const reposToImport = repos.filter((r) => selectedRepoIds.includes(r.id));
    if (reposToImport.length === 0) return;
    await importReposToPortfolio(reposToImport);
  };

  const importReposToPortfolio = async (targetRepos: GitHubRepo[]) => {
    setImporting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let count = 0;
      for (const repo of targetRepos) {
        const title = githubService.formatRepoTitle(repo.name);
        const slug = repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const coverUrl = githubService.getRepoCoverUrl(userProfile?.login || username, repo.name);

        const projectPayload: Partial<Project> = {
          title,
          slug,
          short_description: repo.description || `Repositório open-source desenvolvido em ${repo.language || 'código'}.`,
          cover_image: coverUrl,
          year: repo.pushed_at ? new Date(repo.pushed_at).getFullYear() : new Date().getFullYear(),
          status: 'publicado',
          featured: repo.stargazers_count > 5,
          category_id: selectedCategoryId || (categories[0]?.id || null),
          display_order: 0,
        };

        const savedProject = await portfolioStore.saveProject(projectPayload);

        // Create structured blocks for this project
        const textBlock: ProjectBlock = {
          id: `block-${Date.now()}-1`,
          project_id: savedProject.id,
          type: 'texto',
          content: `### Repositório GitHub: ${repo.name}\n\n${repo.description || 'Sem descrição cadastrada no GitHub.'}\n\n- **Linguagem principal:** ${repo.language || 'N/A'}\n- **Estrelas:** ${repo.stargazers_count} ⭐\n- **Forks:** ${repo.forks_count} 🍴\n- **Tópicos:** ${repo.topics?.join(', ') || 'Geral'}\n\n[Acessar Repositório no GitHub](${repo.html_url})`,
          media_url: '',
          alt_text: '',
          caption: `Dados sincronizados via GitHub REST API (${repo.full_name})`,
          transcript: '',
          display_order: 1,
        };

        const imageBlock: ProjectBlock = {
          id: `block-${Date.now()}-2`,
          project_id: savedProject.id,
          type: 'imagem',
          content: `Visualização do Repositório: ${repo.name}`,
          media_url: coverUrl,
          alt_text: `OpenGraph preview do repositório ${repo.name}`,
          caption: `Card oficial do repositório ${repo.full_name}`,
          transcript: '',
          display_order: 2,
        };

        await portfolioStore.saveBlocks(savedProject.id, [textBlock, imageBlock]);

        count++;
      }

      setSuccessMsg(`${count} repositório(s) importado(s) com sucesso como projeto(s) no portfólio!`);
      setSelectedRepoIds([]);
      onRefreshProjects();

      // Update imported list
      const updated = new Set(importedRepoNames);
      targetRepos.forEach((r) => updated.add(r.name.toLowerCase()));
      setImportedRepoNames(updated);
    } catch (err: any) {
      setErrorMsg(`Erro ao importar projetos: ${err.message || err}`);
    } finally {
      setImporting(false);
    }
  };

  // Extract unique languages
  const availableLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  ) as string[];

  // Filtered repos
  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLang = filterLanguage === 'all' || r.language === filterLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.3em]">
              <Github className="w-5 h-5" />
              <span>Integração Automática GitHub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">
              Sincronizador do GitHub
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl font-medium">
              Busque repositórios do GitHub, veja métricas em tempo real e converta seus projetos open-source diretamente em páginas publicadas do portfólio autoral.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario-github"
                className="pl-8 pr-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[#050505] text-white focus:outline-none focus:border-[var(--color-accent)] w-48 md:w-60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Buscar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* User Profile Card */}
      {userProfile && (
        <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={userProfile.avatar_url}
              alt={userProfile.login}
              className="w-16 h-16 rounded-full border-2 border-[var(--color-accent)] object-cover"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-white">{userProfile.name || userProfile.login}</h3>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">@{userProfile.login}</span>
              </div>
              {userProfile.bio && (
                <p className="text-xs text-[var(--color-text-secondary)] max-w-xl">{userProfile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {userProfile.public_repos} Repositórios
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {userProfile.followers} Seguidores
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleSetMainUser}
              className="flex-1 md:flex-initial px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fixar como Usuário do Portfólio</span>
            </button>
            <a
              href={userProfile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-[var(--radius-sm)] border border-[var(--color-border)] text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Repositories Controls & List */}
      {repos.length > 0 && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nome..."
                className="px-3 py-2 text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[#050505] text-white focus:outline-none focus:border-[var(--color-accent)] w-full md:w-64"
              />

              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-3 py-2 text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[#050505] text-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="all">Todas as Linguagens</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">Categoria de destino:</span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[#050505] text-white focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="">(Primeira categoria)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleImportSelected}
                disabled={selectedRepoIds.length === 0 || importing}
                className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Importar ({selectedRepoIds.length})</span>
              </button>
            </div>
          </div>

          {/* Table Header with Select All */}
          <div className="flex items-center justify-between px-2 text-xs text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedRepoIds.length > 0 && selectedRepoIds.length === filteredRepos.length}
                onChange={selectAllRepos}
                className="rounded border-gray-700 accent-[var(--color-accent)] cursor-pointer"
              />
              <span>Selecionar Todos ({filteredRepos.length} repositórios)</span>
            </div>
            <span>Ações de Importação</span>
          </div>

          {/* Repos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => {
              const isSelected = selectedRepoIds.includes(repo.id);
              const isAlreadyImported = importedRepoNames.has(repo.name.toLowerCase());

              return (
                <div
                  key={repo.id}
                  className={`p-5 rounded-[var(--radius-lg)] border transition-all flex flex-col justify-between gap-4 relative group ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-gray-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRepo(repo.id)}
                          className="rounded border-gray-700 accent-[var(--color-accent)] cursor-pointer mt-0.5"
                        />
                        <h4 className="text-base font-bold text-white group-hover:text-[var(--color-accent)] transition-colors truncate max-w-[180px]">
                          {repo.name}
                        </h4>
                      </div>

                      {isAlreadyImported && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                          Importado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 min-h-[32px]">
                      {repo.description || 'Sem descrição.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span className="text-[var(--color-accent)] font-bold">{repo.language || 'Code'}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" /> {repo.forks_count}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleImportSingle(repo)}
                        disabled={importing}
                        className="flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded bg-white/10 hover:bg-[var(--color-accent)] hover:text-white text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3 h-3" />
                        <span>{isAlreadyImported ? 'Re-importar' : 'Importar Projeto'}</span>
                      </button>

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                        title="Ver no GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
