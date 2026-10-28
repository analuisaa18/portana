import React, { useEffect, useState } from 'react';

export const inputClass = 'w-full px-3 py-2.5 text-sm rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]';
export const cardClass = 'p-4 sm:p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4';
export const fieldClass = 'block text-sm font-semibold text-[var(--color-text-primary)] space-y-2';

export function useDirtyWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const beforeAdminLeave = (event: Event) => {
      if (!window.confirm('Existem alterações não salvas. Deseja descartá-las?')) event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('portfolio:admin-before-leave', beforeAdminLeave);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('portfolio:admin-before-leave', beforeAdminLeave);
    };
  }, [dirty]);
}

export const AdminActions: React.FC<{dirty: boolean; saving: boolean; onSave: () => void; onCancel: () => void; error?: string; success?: string}> = ({ dirty, saving, onSave, onCancel, error, success }) => (
  <div className="flex flex-wrap items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
    <button type="button" onClick={onSave} disabled={saving || !dirty} className="px-5 py-2.5 bg-[var(--color-primary)] text-black font-bold text-sm rounded disabled:opacity-40">{saving ? 'Salvando…' : 'Salvar alterações'}</button>
    <button type="button" onClick={onCancel} disabled={saving || !dirty} className="px-4 py-2.5 text-sm border border-[var(--color-border)] rounded disabled:opacity-40">Cancelar</button>
    {dirty && <span className="text-xs text-[var(--color-warning)]">Alterações não salvas</span>}
    {success && !dirty && <span role="status" className="text-xs">{success}</span>}
    {error && <span role="alert" className="text-xs text-[var(--color-error)]">{error}</span>}
  </div>
);

export function useSaveFeedback() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const run = async (task: () => Promise<void>) => {
    setSaving(true); setError(''); setSuccess('');
    try { await task(); setSuccess('Salvo no Supabase com sucesso.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar no Supabase.'); }
    finally { setSaving(false); }
  };
  return { saving, error, success, run };
}
