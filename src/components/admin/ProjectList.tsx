import React, { useState } from 'react';
import { Project, Category } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Toast, ToastMessage } from '../common/Toast';
import { ProjectEditor } from './ProjectEditor';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, FolderGit2, Star, Eye } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  categories: Category[];
  onRefresh: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  categories,
  onRefresh,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const filteredProjects = filterCategory
    ? projects.filter((p) => p.category_id === filterCategory)
    : projects;

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await portfolioStore.deleteProject(deleteTargetId);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Projeto Excluído',
        message: 'O projeto e seus blocos foram excluídos permanentemente.',
      });
      setDeleteTargetId(null);
      onRefresh();
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
    }
  };

  const handleToggleStatus = async (proj: Project) => {
    const newStatus = proj.status === 'publicado' ? 'rascunho' : 'publicado';
    await portfolioStore.saveProject({ id: proj.id, status: newStatus });
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Status Alterado',
      message: `Projeto "${proj.title}" alterado para ${newStatus.toUpperCase()}.`,
    });
    onRefresh();
  };

  const handleToggleFeatured = async (proj: Project) => {
    await portfolioStore.saveProject({ id: proj.id, featured: !proj.featured });
    onRefresh();
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...projects].sort((a, b) => a.display_order - b.display_order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const tempOrder = sorted[index].display_order;
    sorted[index].display_order = sorted[targetIdx].display_order;
    sorted[targetIdx].display_order = tempOrder;

    await portfolioStore.saveProject(sorted[index]);
    await portfolioStore.saveProject(sorted[targetIdx]);
    onRefresh();
  };

  if (isCreatingNew || editingProject) {
    return (
      <ProjectEditor
        project={editingProject}
        categories={categories}
        onBack={() => {
          setIsCreatingNew(false);
          setEditingProject(null);
        }}
        onSaved={() => {
          setIsCreatingNew(false);
          setEditingProject(null);
          onRefresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Acervo de Projetos
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Cadastre, edite rascunhos, defina destaques e reordene os trabalhos do seu portfólio.
          </p>
        </div>

        <Button
          onClick={() => setIsCreatingNew(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Projeto
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-full)] border cursor-pointer ${
            filterCategory === null
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
          }`}
        >
          Todos ({projects.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-full)] border cursor-pointer ${
              filterCategory === c.id
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
            }`}
          >
            {c.name} ({projects.filter((p) => p.category_id === c.id).length})
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
        {filteredProjects.length > 0 ? (
          <div className="divide-y divide-[var(--color-border)]">
            {filteredProjects
              .sort((a, b) => a.display_order - b.display_order)
              .map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-bg)]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover thumbnail */}
                    {proj.cover_image ? (
                      <img
                        src={proj.cover_image}
                        alt=""
                        className="w-16 h-12 object-cover rounded-[var(--radius-md)] border border-[var(--color-border)] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-[var(--radius-md)] bg-[var(--color-border)]/40 flex items-center justify-center shrink-0 text-[var(--color-text-secondary)]">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                          {proj.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(proj)}
                          className="cursor-pointer"
                        >
                          {proj.status === 'publicado' ? (
                            <Badge variant="success" size="sm">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              Rascunho
                            </Badge>
                          )}
                        </button>
                        {proj.featured && (
                          <Badge variant="accent" size="sm">
                            Destaque
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                        <span>{proj.category?.name || 'Sem Categoria'}</span>
                        <span>•</span>
                        <span className="font-mono">{proj.year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(proj)}
                      className={`p-2 rounded-[var(--radius-md)] border cursor-pointer ${
                        proj.featured
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                          : 'text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-black/5'
                      }`}
                      title={proj.featured ? 'Remover Destaque' : 'Marcar como Destaque'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>

                    {/* Order Controls */}
                    <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
                        title="Mover Projeto para Cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === filteredProjects.length - 1}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer border-l border-[var(--color-border)]"
                        title="Mover Projeto para Baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingProject(proj)}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-black/5 cursor-pointer"
                      title="Editar Projeto e Blocos"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(proj.id)}
                      className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-[var(--radius-md)] cursor-pointer"
                      title="Excluir Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            Nenhum projeto encontrado. Clique em "Novo Projeto" para começar a estruturar seu acervo.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirmar Exclusão de Projeto"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-primary)]">
            Esta ação excluirá permanentemente o projeto e todos os seus blocos de conteúdo (textos, imagens, vídeos e áudios).
          </p>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTargetId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
