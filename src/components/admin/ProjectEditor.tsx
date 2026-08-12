import React, { useState, useEffect } from 'react';
import { Project, Category, ProjectBlock, BlockType, ProjectStatus } from '../../types/portfolio';
import { portfolioStore } from '../../services/store';
import { Button } from '../common/Button';
import { Toast, ToastMessage } from '../common/Toast';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface ProjectEditorProps {
  project?: Project | null;
  categories: Category[];
  onBack: () => void;
  onSaved: () => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  categories,
  onBack,
  onSaved,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    category_id: categories[0]?.id || null,
    short_description: '',
    cover_image: '',
    year: new Date().getFullYear(),
    status: 'rascunho' as ProjectStatus,
    featured: false,
    display_order: 1,
  });

  const [blocks, setBlocks] = useState<ProjectBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (project) {
      setFormData(project);
      portfolioStore.getProjectBlocks(project.id).then((blockData) => {
        setBlocks(blockData);
      });
    }
  }, [project]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await portfolioStore.uploadFile(file, 'covers');
      setFormData({ ...formData, cover_image: url });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Capa Enviada',
        message: 'A imagem de capa foi carregada com sucesso.',
      });
    } catch (err) {
      console.error('Erro no upload da capa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: ProjectBlock = {
      id: 'block-' + Date.now(),
      project_id: project?.id || '',
      type,
      content: type === 'texto' ? 'Escreva seu texto aqui...' : '',
      media_url: '',
      alt_text: '',
      caption: '',
      transcript: '',
      display_order: blocks.length + 1,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (index: number, field: keyof ProjectBlock, value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
  };

  const handleBlockMediaUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const folder = blocks[index].type === 'audio' ? 'audios' : 'images';
      const url = await portfolioStore.uploadFile(file, folder);
      handleUpdateBlock(index, 'media_url', url);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Arquivo de Mídia Enviado',
        message: 'Mídia vinculada ao bloco com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao enviar mídia do bloco:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const savedProj = await portfolioStore.saveProject({
        ...formData,
        slug,
      });

      // Save blocks with updated project ID
      await portfolioStore.saveBlocks(savedProj.id, blocks);

      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Projeto Salvo',
        message: `O projeto "${savedProj.title}" e seus blocos foram salvos com sucesso.`,
      });

      setTimeout(() => {
        onSaved();
      }, 800);
    } catch (err) {
      console.error('Erro ao salvar projeto completo:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro ao Salvar',
        message: 'Ocorreu uma falha ao persistir o projeto.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à lista de projetos</span>
        </button>

        <Button
          type="button"
          onClick={handleSaveAll}
          variant="primary"
          isLoading={loading}
          icon={<Save className="w-4 h-4" />}
        >
          Salvar Projeto Completo
        </Button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* Metadados Principais do Projeto */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3">
            Informações Gerais do Projeto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="proj-title" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Título do Projeto *
              </label>
              <input
                id="proj-title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Sistema de Leitura Tipográfica"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proj-slug" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Slug na URL
              </label>
              <input
                id="proj-slug"
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Ex: sistema-de-leitura (gerado automaticamente se vazio)"
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="proj-category" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Categoria do Projeto
              </label>
              <select
                id="proj-category"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              >
                <option value="">Sem Categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proj-year" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Ano do Projeto
              </label>
              <input
                id="proj-year"
                type="number"
                value={formData.year || new Date().getFullYear()}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proj-status" className="block text-xs font-semibold text-[var(--color-text-primary)]">
                Status de Publicação *
              </label>
              <select
                id="proj-status"
                value={formData.status || 'rascunho'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] font-semibold"
              >
                <option value="rascunho">Rascunho (Privado)</option>
                <option value="publicado">Publicado (Visível no Portfólio)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proj-desc" className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Breve Descrição / Apresentação
            </label>
            <textarea
              id="proj-desc"
              rows={3}
              value={formData.short_description || ''}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Resumo do projeto exibido no cartão do acervo..."
              className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
              Imagem de Capa do Projeto (URL ou Upload)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Pré-visualização da capa"
                  className="w-32 h-20 object-cover rounded-[var(--radius-md)] border border-[var(--color-border)]"
                />
              )}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  value={formData.cover_image || ''}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://exemplo.com/imagem-capa.jpg"
                  className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)]"
                />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fazer Upload de Imagem de Capa</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="proj-featured"
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-[var(--color-accent)] rounded-[var(--radius-sm)] border-[var(--color-border)] cursor-pointer"
            />
            <label htmlFor="proj-featured" className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
              Marcar como Projeto em Destaque
            </label>
          </div>
        </div>

        {/* Sequential Content Blocks Section */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Blocos de Conteúdo do Projeto
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Adicione e reordene textos, imagens, vídeos do YouTube e arquivos de áudio.
              </p>
            </div>

            {/* Add Block Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddBlock('texto')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-black/5 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>+ Texto</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('imagem')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-black/5 flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[var(--color-success)]" />
                <span>+ Imagem</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('video')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-black/5 flex items-center gap-1 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-[var(--color-error)]" />
                <span>+ Vídeo YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('audio')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-black/5 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>+ Áudio</span>
              </button>
            </div>
          </div>

          {/* List of Blocks */}
          {blocks.length > 0 ? (
            <div className="space-y-6">
              {blocks.map((block, idx) => (
                <div
                  key={block.id || idx}
                  className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] space-y-4 shadow-xs relative"
                >
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                        Bloco de {block.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move controls */}
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, 'down')}
                        disabled={idx === blocks.length - 1}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(idx)}
                        className="p-1 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded cursor-pointer ml-2"
                        title="Excluir bloco"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Block Type Fields */}
                  {block.type === 'texto' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                        Conteúdo do Texto
                      </label>
                      <textarea
                        rows={5}
                        value={block.content}
                        onChange={(e) => handleUpdateBlock(idx, 'content', e.target.value)}
                        placeholder="Escreva parágrafos, tópicos ou explicações do projeto..."
                        className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                      />
                    </div>
                  )}

                  {block.type === 'imagem' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          URL da Imagem ou Upload
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={block.media_url}
                            onChange={(e) => handleUpdateBlock(idx, 'media_url', e.target.value)}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                          />
                          <label className="px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBlockMediaUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          Texto Alternativo (alt_text) * [Obrigatório para Acessibilidade WCAG]
                        </label>
                        <input
                          type="text"
                          value={block.alt_text}
                          onChange={(e) => handleUpdateBlock(idx, 'alt_text', e.target.value)}
                          placeholder="Descreva a imagem em detalhes para leitores de tela..."
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                        {!block.alt_text && (
                          <p className="text-[11px] text-[var(--color-warning)] flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Atenção: Adicione uma descrição textual acessível.</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          Legenda Opcional da Imagem
                        </label>
                        <input
                          type="text"
                          value={block.caption}
                          onChange={(e) => handleUpdateBlock(idx, 'caption', e.target.value)}
                          placeholder="Ex: Figura 1 — Esboço inicial da arquitetura"
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          URL do Vídeo no YouTube
                        </label>
                        <input
                          type="text"
                          value={block.media_url}
                          onChange={(e) => handleUpdateBlock(idx, 'media_url', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          Título Acessível do Vídeo
                        </label>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => handleUpdateBlock(idx, 'content', e.target.value)}
                          placeholder="Ex: Apresentação em vídeo do protótipo"
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'audio' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          URL do Arquivo de Áudio (MP3/WAV) ou Upload
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={block.media_url}
                            onChange={(e) => handleUpdateBlock(idx, 'media_url', e.target.value)}
                            placeholder="https://exemplo.com/audio.mp3"
                            className="flex-1 px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                          />
                          <label className="px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleBlockMediaUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          Título do Áudio
                        </label>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => handleUpdateBlock(idx, 'content', e.target.value)}
                          placeholder="Ex: Depoimento oral do autor"
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
                          Transcrição Textual Completa (Obrigatório para Acessibilidade)
                        </label>
                        <textarea
                          rows={4}
                          value={block.transcript}
                          onChange={(e) => handleUpdateBlock(idx, 'transcript', e.target.value)}
                          placeholder="Digite a transcrição na íntegra de tudo o que é dito no áudio..."
                          className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
              Nenhum bloco de conteúdo adicionado ainda. Escolha um dos botões acima para incluir textos, imagens, vídeos ou áudios.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} icon={<Check className="w-4 h-4" />}>
            Salvar Projeto
          </Button>
        </div>
      </form>
    </div>
  );
};
