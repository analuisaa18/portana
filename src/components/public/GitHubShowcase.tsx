import React, { useEffect, useState } from 'react';
import { githubService, GitHubUser, GitHubRepo } from '../../services/github';
import { Github, Star, GitFork, ExternalLink, Code, Layers, Sparkles } from 'lucide-react';

interface GitHubShowcaseProps {
  githubUsername?: string;
}

export const GitHubShowcase: React.FC<GitHubShowcaseProps> = ({ githubUsername = 'anabochenek' }) => {
  const [profile, setProfile] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadGitHubData = async () => {
      setLoading(true);
      setError(false);
      try {
        const user = await githubService.getUserProfile(githubUsername);
        setProfile(user);
        const repoData = await githubService.getUserRepos(githubUsername);
        setRepos(repoData.slice(0, 6)); // Top 6 repositories
      } catch (err) {
        console.warn('Erro ao carregar repositórios do GitHub para exibição pública:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (githubUsername) {
      loadGitHubData();
    }
  }, [githubUsername]);

  if (error || (!loading && !profile)) {
    return null; // Gracefully hide if username doesn't exist or offline
  }

  return (
    <section className="py-16 border-t border-[var(--color-border)] relative overflow-hidden my-12">
      <div className="max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-padding)] space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.4em]">
              <Github className="w-4 h-4" />
              <span>Sincronia GitHub Open Source</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">
              REPOSITÓRIOS &<br />
              <span className="text-[var(--color-accent)]">CÓDIGO ABERTO</span>
            </h2>
            <p className="text-sm md:text-base text-[var(--color-text-secondary)] font-medium">
              Repositórios ativos e projetos de código aberto mantidos publicamente no GitHub.
            </p>
          </div>

          {profile && (
            <div className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <img
                src={profile.avatar_url}
                alt={profile.login}
                className="w-12 h-12 rounded-full border-2 border-[var(--color-accent)] object-cover"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-black text-white block">@{profile.login}</span>
                <span className="text-[10px] font-mono text-gray-400 block">
                  {profile.public_repos} Repositórios • {profile.followers} Seguidores
                </span>
              </div>
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-2 rounded-full bg-[var(--color-accent)] text-white hover:opacity-80 transition-opacity"
                title="Ver perfil no GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-44 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse space-y-4"
              >
                <div className="h-5 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Repos Grid */}
        {!loading && repos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <article
                key={repo.id}
                className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all duration-300 flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-accent)]">
                      {repo.language || 'Geral'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {repo.pushed_at ? new Date(repo.pushed_at).getFullYear() : ''}
                    </span>
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[var(--color-accent)] transition-colors">
                    {repo.name}
                  </h3>

                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed font-medium">
                    {repo.description || 'Sem descrição cadastrada no repositório.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5" /> {repo.forks_count}
                    </span>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black uppercase tracking-wider text-white hover:text-[var(--color-accent)] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Repositório</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
