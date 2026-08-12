export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
}

export const githubService = {
  /**
   * Fetch GitHub user profile
   */
  async getUserProfile(username: string): Promise<GitHubUser> {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      throw new Error('Nome de usuário do GitHub inválido.');
    }

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Usuário "${cleanUser}" não foi encontrado no GitHub.`);
      }
      throw new Error(`Erro ao buscar dados do GitHub (${res.status}).`);
    }

    return await res.json();
  },

  /**
   * Fetch public repositories of a user
   */
  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      throw new Error('Nome de usuário do GitHub inválido.');
    }

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100`);
    if (!res.ok) {
      throw new Error(`Não foi possível carregar os repositórios de "${cleanUser}".`);
    }

    const repos: GitHubRepo[] = await res.json();
    // Sort non-forked repos first, then by stars
    return repos.sort((a, b) => {
      if (a.fork !== b.fork) return a.fork ? 1 : -1;
      return b.stargazers_count - a.stargazers_count;
    });
  },

  /**
   * Helper to format a repo name into a human readable title
   */
  formatRepoTitle(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  },

  /**
   * Helper to generate a default cover image URL for a repo
   */
  getRepoCoverUrl(username: string, repoName: string): string {
    return `https://opengraph.githubassets.com/1/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`;
  }
};
