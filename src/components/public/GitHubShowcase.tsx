import React from 'react';
import { GitBranch, Star, FolderGit2, Code2 } from 'lucide-react';

interface GitHubShowcaseProps {
  username: string;
}

export default function GitHubShowcase({ username }: GitHubShowcaseProps) {
  return (
    <section className="py-16 px-4 md:px-8 bg-neutral-950 border-t border-b border-neutral-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Open Source & Activity</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">GitHub Overview</h2>
          </div>
          <a 
            href={`https://github.com/${username}`} 
            target="_blank" 
            rel="noreferrer"
            className="mt-4 md:mt-0 text-sm font-semibold hover:underline flex items-center gap-2"
          >
            Ver perfil completo →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <FolderGit2 className="w-8 h-8 text-neutral-400 mb-4" />
            <div className="text-3xl font-bold">24+</div>
            <div className="text-sm text-neutral-500 mt-1">Repositórios Públicos</div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <Star className="w-8 h-8 text-neutral-400 mb-4" />
            <div className="text-3xl font-bold">180+</div>
            <div className="text-sm text-neutral-500 mt-1">Stars Recebidas</div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <GitBranch className="w-8 h-8 text-neutral-400 mb-4" />
            <div className="text-3xl font-bold">450+</div>
            <div className="text-sm text-neutral-500 mt-1">Commits no Último Ano</div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <Code2 className="w-8 h-8 text-neutral-400 mb-4" />
            <div className="text-3xl font-bold">TypeScript</div>
            <div className="text-sm text-neutral-500 mt-1">Linguagem Mais Usada</div>
          </div>
        </div>
      </div>
    </section>
  );
}
