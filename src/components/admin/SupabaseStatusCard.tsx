import React from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export const SupabaseStatusCard: React.FC = () => {
  const isConnected = isSupabaseConfigured();

  return (
    <div className={`p-5 rounded-[var(--radius-xl)] border shadow-xs transition-colors ${
      isConnected 
        ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/5' 
        : 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-[var(--radius-lg)] shrink-0 ${
            isConnected ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Status da Conexão com o Supabase
              </h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">
                  <CheckCircle2 className="w-3 h-3" /> Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)]">
                  <AlertTriangle className="w-3 h-3" /> Modo Persistente Local Active
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              {isConnected
                ? 'Sua aplicação está conectada ao Supabase Database e Storage. Todos os dados e arquivos enviados são persistidos diretamente na nuvem.'
                : 'Variáveis de ambiente do Supabase não configuradas no arquivo .env. A aplicação está operando com persistência em armazenamento local (LocalStorage), garantindo que nada seja perdido no seu navegador.'}
            </p>

            {!isConnected && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1">
                <p className="font-semibold text-[var(--color-text-primary)]">Como conectar seu projeto Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Execute o arquivo SQL presente em <code className="bg-black/10 dark:bg-white/10 px-1 rounded">supabase/schema.sql</code> no seu projeto Supabase.</li>
                  <li>Adicione <code className="bg-black/10 dark:bg-white/10 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-black/10 dark:bg-white/10 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code className="bg-black/10 dark:bg-white/10 px-1 rounded">.env</code>.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 font-medium shrink-0"
        >
          <span>Supabase Docs</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
