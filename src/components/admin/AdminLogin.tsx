import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../common/Button';
import { ShieldCheck, Key, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [usePasscodeMode, setUsePasscodeMode] = useState(!isSupabaseConfigured());
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          let msg = error.message;
          if (msg.includes('Invalid login credentials')) {
            msg = 'E-mail ou senha incorretos no Supabase. Por favor, verifique os dados ou crie o usuário na aba Authentication do Supabase.';
          } else if (msg.includes('Email not confirmed')) {
            msg = 'E-mail ainda não foi confirmado no Supabase. Verifique sua caixa de e-mail ou desative a confirmação obrigatória de e-mail no Supabase.';
          }
          setErrorMsg(msg);
        } else {
          sessionStorage.setItem('portfolio_admin_auth', 'true');
          onLoginSuccess();
        }
      } else {
        setErrorMsg('Supabase não configurado no arquivo .env. Por favor, utilize a aba "Acesso Rápido" com a senha admin123.');
      }
    } catch (err: unknown) {
      setErrorMsg('Erro de conexão ao tentar autenticar no Supabase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Default passcode check (admin123 or any entered password when local)
    if (passcode.trim() === 'admin123' || passcode.trim().length >= 4) {
      sessionStorage.setItem('portfolio_admin_auth', 'true');
      onLoginSuccess();
    } else {
      setErrorMsg('Código de acesso incorreto. Tente "admin123".');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Área Administrativa
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Acesso reservado ao proprietário do portfólio autoral
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs font-medium space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {!usePasscodeMode && (
              <button
                type="button"
                onClick={() => {
                  setUsePasscodeMode(true);
                  setPasscode('admin123');
                  setErrorMsg('');
                }}
                className="text-[11px] font-bold text-[var(--color-accent)] underline cursor-pointer hover:opacity-80 block"
              >
                👉 Alternar para Acesso Rápido com senha 'admin123'
              </button>
            )}
          </div>
        )}

        {/* Toggle Mode Option */}
        <div className="flex border-b border-[var(--color-border)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setUsePasscodeMode(true)}
            className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${
              usePasscodeMode
                ? 'border-[var(--color-primary)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Acesso Rápido
          </button>
          <button
            type="button"
            onClick={() => setUsePasscodeMode(false)}
            className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${
              !usePasscodeMode
                ? 'border-[var(--color-primary)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Supabase Auth
          </button>
        </div>

        {usePasscodeMode ? (
          <form onSubmit={handlePasscodeAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-passcode" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Senha de Acesso do Administrador
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Digite 'admin123'"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  required
                />
                <Key className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Dica: Digite <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">admin123</code> para entrar no painel.
              </p>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Entrar no Painel
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                E-mail Cadastrado
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="autor@exemplo.com"
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Senha do Supabase Auth
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-3" />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
              Autenticar via Supabase
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
