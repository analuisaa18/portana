import React, { useState } from 'react';
import { Category } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Toast, ToastMessage } from '../common/Toast';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Layers, AlertCircle } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      display_order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    setLoading(true);
    try {
      const slug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await portfolioStore.saveCategory({ ...editingCategory, slug });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Categoria Salva',
        message: `A categoria "${editingCategory.name}" foi salva com sucesso.`,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Não foi possível salvar a categoria.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await portfolioStore.deleteCategory(deleteTargetId);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Categoria Excluída',
        message: 'A categoria foi excluída com sucesso.',
      });
      setDeleteTargetId(null);
      onRefresh();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao Excluir',
        message: 'Não foi possível excluir a categoria.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    // Swap orders
    const tempOrder = sorted[index].display_order;
    sorted[index].display_order = sorted[targetIdx].display_order;
    sorted[targetIdx].display_order = tempOrder;

    await portfolioStore.saveCategory(sorted[index]);
    await portfolioStore.saveCategory(sorted[targetIdx]);
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Gerenciamento de Categorias
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Organize os temas e agrupamentos dos seus projetos autorais.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Categoria
        </Button>
      </div>

      {/* Categories Table / List */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
        {categories.length > 0 ? (
          <div className="divide-y divide-[var(--color-border)]">
            {categories
              .sort((a, b) => a.display_order - b.display_order)
              .map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-bg)]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">{cat.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                        /{cat.slug}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-[var(--color-text-secondary)]">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Order Controls */}
                    <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
                        title="Mover Categoria para Cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer border-l border-[var(--color-border)]"
                        title="Mover Categoria para Baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-black/5 cursor-pointer"
                      title="Editar Categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(cat.id)}
                      className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-[var(--radius-md)] cursor-pointer"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            Nenhuma categoria cadastrada ainda. Clique em "Nova Categoria" para criar a primeira.
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory?.id ? 'Editar Categoria' : 'Criar Nova Categoria'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="cat-name" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Nome da Categoria *
            </label>
            <input
              id="cat-name"
              type="text"
              value={editingCategory?.name || ''}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              placeholder="Ex: Design Gráfico"
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cat-slug" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Slug da URL
            </label>
            <input
              id="cat-slug"
              type="text"
              value={editingCategory?.slug || ''}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, slug: e.target.value })
              }
              placeholder="Ex: design-grafico (deixe em branco para gerar automaticamente)"
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cat-desc" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Breve Descrição
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={editingCategory?.description || ''}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, description: e.target.value })
              }
              placeholder="Descrição do tipo de trabalhos incluídos nesta categoria..."
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={loading}>
              Salvar Categoria
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirmar Exclusão de Categoria"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Projetos vinculados a esta categoria não serão excluídos, mas perderão a associação de categoria.</span>
          </div>
          <p className="text-sm text-[var(--color-text-primary)]">
            Tem certeza de que deseja excluir esta categoria do seu portfólio?
          </p>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTargetId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading}>
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
