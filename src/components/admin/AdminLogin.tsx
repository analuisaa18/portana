import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../common/Button';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isSupabaseConfigured()) {
      setErrorMsg('O acesso administrativo exige o Supabase configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session) {
        let msg = error?.message || 'Não foi possível autenticar.';
        if (msg.includes('Invalid login credentials')) {
          msg = 'E-mail ou senha incorretos.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'E-mail ainda não foi confirmado no Supabase.';
        }
        setErrorMsg(msg);
        return;
      }

      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão ao tentar autenticar no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Área Administrativa</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Acesso protegido pela autenticação do Supabase.</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="flex gap-3 p-3 rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>O Supabase não está configurado neste ambiente. O painel administrativo fica bloqueado até a configuração ser corrigida.</p>
          </div>
        )}

        {errorMsg && (
          <div className="flex gap-3 p-3 rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSupabaseAuth} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              placeholder="seu@email.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Senha</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
                placeholder="Sua senha"
              />
            </div>
          </label>

          <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured()}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-xs text-center text-[var(--color-text-secondary)]">
          Somente usuários cadastrados no Supabase Authentication podem acessar este painel.
        </p>
      </div>
    </div>
  );
};
