import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  PortfolioSettings, 
  Category, 
  Project, 
  ProjectBlock 
} from '../types/portfolio';
import { 
  DEFAULT_PORTFOLIO_SETTINGS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_PROJECTS, 
  DEFAULT_BLOCKS 
} from './defaultData';

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'portfolio_autoral_settings',
  CATEGORIES: 'portfolio_autoral_categories',
  PROJECTS: 'portfolio_autoral_projects',
  BLOCKS: 'portfolio_autoral_blocks',
};

// LocalStorage helpers with automatic seeding
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

// Store Implementation
export const portfolioStore = {
  // Check if Supabase is actively connected
  isConnectedToSupabase(): boolean {
    return isSupabaseConfigured();
  },

  // SETTINGS
  async getSettings(): Promise<PortfolioSettings> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('portfolio_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('Erro ao carregar configurações do Supabase, fallback para LocalStorage:', error.message);
        } else if (data) {
          return {
            ...DEFAULT_PORTFOLIO_SETTINGS,
            ...data,
            theme_config: data.theme_config || DEFAULT_PORTFOLIO_SETTINGS.theme_config,
            social_links: data.social_links || DEFAULT_PORTFOLIO_SETTINGS.social_links,
          };
        }
      } catch (err) {
        console.warn('Falha no Supabase, usando LocalStorage:', err);
      }
    }
    return getLocalItem<PortfolioSettings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_PORTFOLIO_SETTINGS);
  },

  async updateSettings(settings: Partial<PortfolioSettings>): Promise<PortfolioSettings> {
    const current = await this.getSettings();
    const updated: PortfolioSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    setLocalItem(LOCAL_STORAGE_KEYS.SETTINGS, updated);

    if (isSupabaseConfigured()) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const payload = {
          portfolio_name: updated.portfolio_name,
          tagline: updated.tagline,
          about_title: updated.about_title,
          about_text: updated.about_text,
          short_bio: updated.short_bio,
          profile_image: updated.profile_image,
          whatsapp: updated.whatsapp,
          email_public: updated.email_public,
          location: updated.location,
          github_username: updated.github_username,
          social_links: updated.social_links,
          ux_voice: updated.ux_voice,
          theme_config: updated.theme_config,
        };

        if (current.id) {
          await supabase
            .from('portfolio_settings')
            .update(payload)
            .eq('id', current.id);
        } else {
          await supabase
            .from('portfolio_settings')
            .insert([{ ...payload, owner_id: user.user?.id }]);
        }
      } catch (err) {
        console.error('Erro ao atualizar Supabase:', err);
      }
    }

    return updated;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Fallback para categorias locais:', err);
      }
    }
    return getLocalItem<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    let resultCategory: Category;

    if (category.id) {
      const index = categories.findIndex(c => c.id === category.id);
      if (index >= 0) {
        categories[index] = { ...categories[index], ...category } as Category;
        resultCategory = categories[index];
      } else {
        resultCategory = {
          id: category.id,
          name: category.name || 'Nova Categoria',
          slug: category.slug || 'nova-categoria',
          description: category.description || '',
          display_order: category.display_order || categories.length + 1,
        };
        categories.push(resultCategory);
      }
    } else {
      resultCategory = {
        id: 'cat-' + Date.now(),
        name: category.name || 'Nova Categoria',
        slug: category.slug || 'nova-categoria-' + Date.now(),
        description: category.description || '',
        display_order: category.display_order || categories.length + 1,
      };
      categories.push(resultCategory);
    }

    setLocalItem(LOCAL_STORAGE_KEYS.CATEGORIES, categories);

    if (isSupabaseConfigured()) {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (category.id && !category.id.startsWith('cat-')) {
          await supabase
            .from('categories')
            .update({
              name: resultCategory.name,
              slug: resultCategory.slug,
              description: resultCategory.description,
              display_order: resultCategory.display_order,
            })
            .eq('id', category.id);
        } else {
          const { data } = await supabase
            .from('categories')
            .insert([{
              owner_id: user.user?.id,
              name: resultCategory.name,
              slug: resultCategory.slug,
              description: resultCategory.description,
              display_order: resultCategory.display_order,
            }])
            .select()
            .single();

          if (data) resultCategory = data;
        }
      } catch (err) {
        console.error('Erro ao salvar categoria no Supabase:', err);
      }
    }

    return resultCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    setLocalItem(LOCAL_STORAGE_KEYS.CATEGORIES, filtered);

    if (isSupabaseConfigured() && !id.startsWith('cat-')) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir categoria do Supabase:', err);
      }
    }
  },

  // PROJECTS
  async getProjects(includeDrafts = false): Promise<Project[]> {
    let projects: Project[] = [];
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('projects')
          .select('*, category:categories(*)')
          .order('display_order', { ascending: true });

        if (!includeDrafts) {
          query = query.eq('status', 'publicado');
        }

        const { data, error } = await query;
        if (!error && data) {
          projects = data;
        }
      } catch (err) {
        console.warn('Fallback para projetos locais:', err);
      }
    }

    if (projects.length === 0) {
      projects = getLocalItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
      const categories = await this.getCategories();
      projects = projects.map(p => ({
        ...p,
        category: categories.find(c => c.id === p.category_id),
      }));

      if (!includeDrafts) {
        projects = projects.filter(p => p.status === 'publicado');
      }
    }

    return projects.sort((a, b) => a.display_order - b.display_order);
  },

  async getProjectBySlug(slug: string, includeDrafts = true): Promise<Project | null> {
    const projects = await this.getProjects(includeDrafts);
    const found = projects.find(p => p.slug === slug);
    if (!found) return null;

    const blocks = await this.getProjectBlocks(found.id);
    return { ...found, blocks };
  },

  async saveProject(project: Partial<Project>): Promise<Project> {
    const projects = getLocalItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    let resultProject: Project;

    if (project.id) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index >= 0) {
        projects[index] = {
          ...projects[index],
          ...project,
          updated_at: new Date().toISOString(),
        } as Project;
        resultProject = projects[index];
      } else {
        resultProject = {
          id: project.id,
          category_id: project.category_id || null,
          title: project.title || 'Novo Projeto',
          slug: project.slug || 'novo-projeto-' + Date.now(),
          short_description: project.short_description || '',
          cover_image: project.cover_image || '',
          year: project.year || new Date().getFullYear(),
          status: project.status || 'rascunho',
          featured: project.featured || false,
          display_order: project.display_order || projects.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        projects.push(resultProject);
      }
    } else {
      resultProject = {
        id: 'proj-' + Date.now(),
        category_id: project.category_id || null,
        title: project.title || 'Novo Projeto',
        slug: project.slug || 'novo-projeto-' + Date.now(),
        short_description: project.short_description || '',
        cover_image: project.cover_image || '',
        year: project.year || new Date().getFullYear(),
        status: project.status || 'rascunho',
        featured: project.featured || false,
        display_order: project.display_order || projects.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      projects.push(resultProject);
    }

    setLocalItem(LOCAL_STORAGE_KEYS.PROJECTS, projects);

    if (isSupabaseConfigured()) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const payload = {
          category_id: resultProject.category_id,
          title: resultProject.title,
          slug: resultProject.slug,
          short_description: resultProject.short_description,
          cover_image: resultProject.cover_image,
          year: resultProject.year,
          status: resultProject.status,
          featured: resultProject.featured,
          display_order: resultProject.display_order,
        };

        if (project.id && !project.id.startsWith('proj-')) {
          await supabase.from('projects').update(payload).eq('id', project.id);
        } else {
          const { data } = await supabase
            .from('projects')
            .insert([{ ...payload, owner_id: user.user?.id }])
            .select()
            .single();

          if (data) resultProject = data;
        }
      } catch (err) {
        console.error('Erro ao salvar projeto no Supabase:', err);
      }
    }

    return resultProject;
  },

  async deleteProject(id: string): Promise<void> {
    const projects = getLocalItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    const filtered = projects.filter(p => p.id !== id);
    setLocalItem(LOCAL_STORAGE_KEYS.PROJECTS, filtered);

    const allBlocks = getLocalItem<Record<string, ProjectBlock[]>>(LOCAL_STORAGE_KEYS.BLOCKS, DEFAULT_BLOCKS);
    delete allBlocks[id];
    setLocalItem(LOCAL_STORAGE_KEYS.BLOCKS, allBlocks);

    if (isSupabaseConfigured() && !id.startsWith('proj-')) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao deletar projeto no Supabase:', err);
      }
    }
  },

  // PROJECT BLOCKS
  async getProjectBlocks(projectId: string): Promise<ProjectBlock[]> {
    if (isSupabaseConfigured() && !projectId.startsWith('proj-')) {
      try {
        const { data, error } = await supabase
          .from('project_blocks')
          .select('*')
          .eq('project_id', projectId)
          .order('display_order', { ascending: true });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Fallback para blocos locais:', err);
      }
    }

    const allBlocks = getLocalItem<Record<string, ProjectBlock[]>>(LOCAL_STORAGE_KEYS.BLOCKS, DEFAULT_BLOCKS);
    return (allBlocks[projectId] || []).sort((a, b) => a.display_order - b.display_order);
  },

  async saveBlocks(projectId: string, blocks: ProjectBlock[]): Promise<ProjectBlock[]> {
    const formattedBlocks = blocks.map((b, idx) => ({
      ...b,
      project_id: projectId,
      display_order: idx + 1,
    }));

    const allBlocks = getLocalItem<Record<string, ProjectBlock[]>>(LOCAL_STORAGE_KEYS.BLOCKS, DEFAULT_BLOCKS);
    allBlocks[projectId] = formattedBlocks;
    setLocalItem(LOCAL_STORAGE_KEYS.BLOCKS, allBlocks);

    if (isSupabaseConfigured() && !projectId.startsWith('proj-')) {
      try {
        // Replace all blocks in Supabase for this project
        await supabase.from('project_blocks').delete().eq('project_id', projectId);
        
        const payload = formattedBlocks.map(b => ({
          project_id: projectId,
          type: b.type,
          content: b.content,
          media_url: b.media_url,
          alt_text: b.alt_text,
          caption: b.caption,
          transcript: b.transcript,
          display_order: b.display_order,
        }));

        if (payload.length > 0) {
          await supabase.from('project_blocks').insert(payload);
        }
      } catch (err) {
        console.error('Erro ao sincronizar blocos no Supabase:', err);
      }
    }

    return formattedBlocks;
  },

  // FILE UPLOAD (Storage)
  async uploadFile(file: File, path: string): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error } = await supabase.storage
          .from('portfolio-media')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!error) {
          const { data: publicUrlData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(filePath);

          return publicUrlData.publicUrl;
        } else {
          console.warn('Erro ao fazer upload no Supabase Storage, criando URL local:', error.message);
        }
      } catch (err) {
        console.warn('Falha no upload para o Supabase Storage:', err);
      }
    }

    // Fallback: local blob URL or base64 reader
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};
