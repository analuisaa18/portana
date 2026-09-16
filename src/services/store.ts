import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  PortfolioSettings,
  Category,
  Project,
  ProjectBlock,
} from '../types/portfolio';
import {
  DEFAULT_PORTFOLIO_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_PROJECTS,
} from './defaultData';
import { normalizePortfolioSettings, normalizeThemeConfig } from './normalizers';

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'portfolio_autoral_settings',
  CATEGORIES: 'portfolio_autoral_categories',
  PROJECTS: 'portfolio_autoral_projects',
  BLOCKS: 'portfolio_autoral_blocks',
  RECOVERY_DONE: 'portfolio_autoral_recovery_done_v2',
};

const DATA_CHANGED_EVENT = 'portfolio:data-changed';
const configuredOwnerId = (import.meta.env.VITE_PORTFOLIO_OWNER_ID || '').trim();

const isUuid = (value?: string | null) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

function readLocalItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocalBackup<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Não foi possível atualizar o backup local do portfólio:', error);
  }
}

function emitDataChanged(kind: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { kind } }));
}

const settingsPayload = (settings: PortfolioSettings) => ({
  portfolio_name: settings.portfolio_name,
  tagline: settings.tagline,
  about_title: settings.about_title,
  about_text: settings.about_text,
  short_bio: settings.short_bio,
  profile_image: settings.profile_image,
  whatsapp: settings.whatsapp,
  email_public: settings.email_public,
  location: settings.location,
  github_username: settings.github_username || '',
  social_links: settings.social_links,
  ux_voice: settings.ux_voice,
  theme_config: normalizeThemeConfig(settings.theme_config),
  // Bancos antigos podem não ter o trigger de updated_at. Gravamos a data
  // explicitamente para o frontend público identificar a configuração recém-salva.
  updated_at: settings.updated_at || new Date().toISOString(),
});

const withoutGithubUsername = <T extends Record<string, unknown>>(payload: T) => {
  const { github_username: _githubUsername, ...legacyPayload } = payload;
  return legacyPayload;
};

const isMissingGithubUsernameColumn = (error: any) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('github_username') && (
    message.includes('column') ||
    message.includes('schema cache') ||
    error?.code === 'PGRST204' ||
    error?.code === '42703'
  );
};

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function isLegacyAiDefaultSettings(settings: PortfolioSettings): boolean {
  const theme = settings.theme_config;
  if (!theme) return false;

  // Assinatura do Design System original gerado pelo Google AI Studio.
  // Isso permite ignorar somente o estado demonstrativo intocado e considerar
  // qualquer personalização da aluna como dado recuperável, inclusive quando
  // ela coincide com os novos fallbacks visuais desta correção.
  return (
    settings.portfolio_name === 'Ana Bochenek — Portfólio Autoral' &&
    theme.colors?.background?.toUpperCase() === '#050505' &&
    theme.colors?.surface?.toUpperCase() === '#0D0D0E' &&
    theme.colors?.textPrimary?.toUpperCase() === '#FFFFFF' &&
    theme.colors?.accent?.toUpperCase() === '#0047FF' &&
    theme.typography?.fontFamilyHeadings === 'Space Grotesk, sans-serif' &&
    theme.typography?.fontFamilyBody === 'Space Grotesk, sans-serif' &&
    theme.header?.animation === 'wrapped3d' &&
    theme.header?.wrappedSurfaceColor?.toUpperCase() === '#0A84FF' &&
    theme.header?.projectTitle3dSurfaceColor?.toUpperCase() === '#9F8CA5'
  );
}

function isExactDefaultCategory(category: Category): boolean {
  const original = DEFAULT_CATEGORIES.find((item) => item.slug === category.slug);
  if (!original) return false;
  const pick = (c: Category) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    display_order: c.display_order,
  });
  return sameJson(pick(category), pick(original));
}

function isExactDefaultProject(project: Project): boolean {
  const original = DEFAULT_PROJECTS.find((item) => item.slug === project.slug);
  if (!original) return false;
  const pick = (p: Project) => ({
    title: p.title,
    slug: p.slug,
    short_description: p.short_description,
    cover_image: p.cover_image,
    year: p.year,
    status: p.status,
    featured: p.featured,
    display_order: p.display_order,
  });
  return sameJson(pick(project), pick(original));
}

async function getSessionUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user?.id || null;
}

async function getLatestSettingsRowForOwner(ownerId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('portfolio_settings')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao carregar configurações do Supabase: ${error.message}`);
  return data || null;
}

async function resolvePublicOwnerId(): Promise<string | null> {
  // Quando VITE_PORTFOLIO_OWNER_ID estiver configurado na Vercel, ele sempre vence.
  if (configuredOwnerId && isUuid(configuredOwnerId)) return configuredOwnerId;

  // Sem variável fixa, usamos a configuração salva mais recentemente. updateSettings()
  // atualiza updated_at explicitamente, portanto não dependemos de trigger em bancos antigos.
  const { data, error } = await supabase
    .from('portfolio_settings')
    .select('owner_id, updated_at, created_at')
    .not('owner_id', 'is', null)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Erro ao identificar o portfólio público: ${error.message}`);
  return data?.owner_id || null;
}

async function resolveOwnerId(): Promise<string | null> {
  const authenticatedOwner = await getSessionUserId();
  if (authenticatedOwner) return authenticatedOwner;
  return resolvePublicOwnerId();
}

async function requireAuthenticatedOwner(): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sessão administrativa inválida ou expirada.');
  return data.user.id;
}

export interface LegacyBrowserSnapshot {
  settings: PortfolioSettings | null;
  categories: Category[];
  projects: Project[];
  blocks: Record<string, ProjectBlock[]>;
  hasCustomData: boolean;
  recoveryAlreadyDone: boolean;
}

export interface LegacyRecoveryResult {
  settingsRecovered: boolean;
  categoriesRecovered: number;
  projectsRecovered: number;
  blocksRecovered: number;
}

export const portfolioStore = {
  isConnectedToSupabase(): boolean {
    return isSupabaseConfigured();
  },

  getDataChangedEventName(): string {
    return DATA_CHANGED_EVENT;
  },

  getLegacyBrowserSnapshot(): LegacyBrowserSnapshot {
    const rawSettings = readLocalItem<PortfolioSettings>(LOCAL_STORAGE_KEYS.SETTINGS);
    const categories = readLocalItem<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES) || [];
    const projects = readLocalItem<Project[]>(LOCAL_STORAGE_KEYS.PROJECTS) || [];
    const blocks = readLocalItem<Record<string, ProjectBlock[]>>(LOCAL_STORAGE_KEYS.BLOCKS) || {};
    const recoveryAlreadyDone = Boolean(readLocalItem<boolean>(LOCAL_STORAGE_KEYS.RECOVERY_DONE));

    const normalizedLegacySettings = rawSettings ? normalizePortfolioSettings(rawSettings) : null;
    const customSettings = rawSettings ? !isLegacyAiDefaultSettings(rawSettings) : false;

    const nonDefaultProjects = projects.filter((project) => !isExactDefaultProject(project));
    const categoriesDiffer = categories.length > 0 && !sameJson(
      categories.map(({ id: _id, owner_id: _owner, created_at: _created, ...rest }) => rest),
      DEFAULT_CATEGORIES.map(({ id: _id, owner_id: _owner, created_at: _created, ...rest }) => rest),
    );

    return {
      settings: normalizedLegacySettings,
      categories,
      projects,
      blocks,
      hasCustomData: customSettings || categoriesDiffer || nonDefaultProjects.length > 0,
      recoveryAlreadyDone,
    };
  },

  async getSettings(): Promise<PortfolioSettings> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase não configurado. O portfólio público precisa do Supabase como fonte de dados.');
    }

    const authenticatedOwner = await getSessionUserId();

    if (authenticatedOwner) {
      const ownRow = await getLatestSettingsRowForOwner(authenticatedOwner);
      if (ownRow) return normalizePortfolioSettings(ownRow);

      // Segurança para instalações antigas: se este navegador contém uma personalização
      // local e o usuário ainda não tem linha própria no banco, mostramos essa cópia no
      // admin para que nada seja perdido antes da recuperação/salvamento.
      const legacy = this.getLegacyBrowserSnapshot();
      if (legacy.settings && legacy.hasCustomData) {
        return normalizePortfolioSettings({ ...legacy.settings, owner_id: authenticatedOwner });
      }

      return normalizePortfolioSettings({ ...DEFAULT_PORTFOLIO_SETTINGS, owner_id: authenticatedOwner });
    }

    const ownerId = await resolvePublicOwnerId();
    if (ownerId) {
      const row = await getLatestSettingsRowForOwner(ownerId);
      if (row) return normalizePortfolioSettings(row);
    }

    // Compatibilidade apenas de leitura com bases antigas que possuíam uma linha sem owner_id.
    const { data, error } = await supabase
      .from('portfolio_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Erro ao carregar configurações do Supabase: ${error.message}`);
    if (!data) throw new Error('Nenhuma configuração do portfólio foi encontrada no Supabase.');
    return normalizePortfolioSettings(data);
  },

  async updateSettings(settings: Partial<PortfolioSettings>): Promise<PortfolioSettings> {
    const ownerId = await requireAuthenticatedOwner();
    const currentRow = await getLatestSettingsRowForOwner(ownerId);

    const base = currentRow
      ? normalizePortfolioSettings(currentRow)
      : normalizePortfolioSettings({ ...DEFAULT_PORTFOLIO_SETTINGS, owner_id: ownerId });

    const updated = normalizePortfolioSettings({
      ...base,
      ...settings,
      owner_id: ownerId,
      theme_config: settings.theme_config
        ? normalizeThemeConfig(settings.theme_config)
        : normalizeThemeConfig(base.theme_config),
      updated_at: new Date().toISOString(),
    });

    const payload = settingsPayload(updated);
    let saved: any = null;

    if (currentRow?.id) {
      let { data, error } = await supabase
        .from('portfolio_settings')
        .update(payload)
        .eq('id', currentRow.id)
        .eq('owner_id', ownerId)
        .select('*')
        .single();

      // O schema original do projeto não tinha github_username. Se o banco da aluna
      // ainda for dessa versão, esse campo opcional não pode impedir que o tema salve.
      if (error && isMissingGithubUsernameColumn(error)) {
        const retry = await supabase
          .from('portfolio_settings')
          .update(withoutGithubUsername(payload))
          .eq('id', currentRow.id)
          .eq('owner_id', ownerId)
          .select('*')
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw new Error(`Erro ao salvar configurações no Supabase: ${error.message}`);
      saved = data;
    } else {
      let { data, error } = await supabase
        .from('portfolio_settings')
        .insert([{ ...payload, owner_id: ownerId }])
        .select('*')
        .single();

      if (error && isMissingGithubUsernameColumn(error)) {
        const retry = await supabase
          .from('portfolio_settings')
          .insert([{ ...withoutGithubUsername(payload), owner_id: ownerId }])
          .select('*')
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw new Error(`Erro ao criar configurações no Supabase: ${error.message}`);
      saved = data;
    }

    const normalized = normalizePortfolioSettings(saved);
    writeLocalBackup(LOCAL_STORAGE_KEYS.SETTINGS, normalized);
    emitDataChanged('settings');
    return normalized;
  },

  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
    const ownerId = await resolveOwnerId();
    if (!ownerId) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('owner_id', ownerId)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Erro ao carregar categorias do Supabase: ${error.message}`);
    return data || [];
  },

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const ownerId = await requireAuthenticatedOwner();
    const payload = {
      name: category.name?.trim() || 'Nova Categoria',
      slug: category.slug?.trim() || `nova-categoria-${Date.now()}`,
      description: category.description ?? '',
      display_order: category.display_order ?? 0,
    };

    let saved: any = null;

    if (isUuid(category.id)) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', category.id)
        .eq('owner_id', ownerId)
        .select('*')
        .maybeSingle();
      if (error) throw new Error(`Erro ao atualizar categoria: ${error.message}`);
      saved = data;
    }

    if (!saved) {
      const { data: existing, error: lookupError } = await supabase
        .from('categories')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('slug', payload.slug)
        .limit(1)
        .maybeSingle();
      if (lookupError) throw new Error(`Erro ao verificar categoria: ${lookupError.message}`);

      if (existing) {
        const { data, error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', existing.id)
          .eq('owner_id', ownerId)
          .select('*')
          .single();
        if (error) throw new Error(`Erro ao atualizar categoria: ${error.message}`);
        saved = data;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ ...payload, owner_id: ownerId }])
          .select('*')
          .single();
        if (error) throw new Error(`Erro ao criar categoria: ${error.message}`);
        saved = data;
      }
    }

    writeLocalBackup(LOCAL_STORAGE_KEYS.CATEGORIES, await this.getCategories());
    emitDataChanged('categories');
    return saved as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    const ownerId = await requireAuthenticatedOwner();
    if (!isUuid(id)) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);
    if (error) throw new Error(`Erro ao excluir categoria: ${error.message}`);

    writeLocalBackup(LOCAL_STORAGE_KEYS.CATEGORIES, await this.getCategories());
    emitDataChanged('categories');
  },

  async getProjects(includeDrafts = false): Promise<Project[]> {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
    const ownerId = await resolveOwnerId();
    if (!ownerId) return [];

    let query = supabase
      .from('projects')
      .select('*, category:categories(*)')
      .eq('owner_id', ownerId)
      .order('display_order', { ascending: true });

    if (!includeDrafts) query = query.eq('status', 'publicado');

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao carregar projetos do Supabase: ${error.message}`);
    return (data || []) as Project[];
  },

  async getProjectBySlug(slug: string, includeDrafts = false): Promise<Project | null> {
    const projects = await this.getProjects(includeDrafts);
    const found = projects.find((project) => project.slug === slug);
    if (!found) return null;

    const blocks = await this.getProjectBlocks(found.id);
    return { ...found, blocks };
  },

  async saveProject(project: Partial<Project>): Promise<Project> {
    const ownerId = await requireAuthenticatedOwner();
    let current: Project | null = null;

    if (isUuid(project.id)) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .eq('owner_id', ownerId)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`Erro ao localizar projeto: ${error.message}`);
      current = data as Project | null;
    }

    const now = new Date().toISOString();
    const merged: Project = {
      id: current?.id || project.id || '',
      owner_id: ownerId,
      category_id: project.category_id !== undefined ? project.category_id : (current?.category_id ?? null),
      title: project.title ?? current?.title ?? 'Novo Projeto',
      slug: project.slug ?? current?.slug ?? `novo-projeto-${Date.now()}`,
      short_description: project.short_description ?? current?.short_description ?? '',
      cover_image: project.cover_image ?? current?.cover_image ?? '',
      year: project.year ?? current?.year ?? new Date().getFullYear(),
      status: project.status ?? current?.status ?? 'rascunho',
      featured: project.featured ?? current?.featured ?? false,
      display_order: project.display_order ?? current?.display_order ?? 0,
      created_at: current?.created_at ?? now,
      updated_at: now,
    };

    const payload = {
      category_id: merged.category_id,
      title: merged.title,
      slug: merged.slug,
      short_description: merged.short_description,
      cover_image: merged.cover_image,
      year: merged.year,
      status: merged.status,
      featured: merged.featured,
      display_order: merged.display_order,
    };

    let saved: any = null;

    if (current?.id) {
      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', current.id)
        .eq('owner_id', ownerId)
        .select('*')
        .single();
      if (error) throw new Error(`Erro ao atualizar projeto: ${error.message}`);
      saved = data;
    } else {
      const { data: existing, error: lookupError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('slug', merged.slug)
        .limit(1)
        .maybeSingle();
      if (lookupError) throw new Error(`Erro ao verificar projeto: ${lookupError.message}`);

      if (existing) {
        const { data, error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', existing.id)
          .eq('owner_id', ownerId)
          .select('*')
          .single();
        if (error) throw new Error(`Erro ao atualizar projeto: ${error.message}`);
        saved = data;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([{ ...payload, owner_id: ownerId }])
          .select('*')
          .single();
        if (error) throw new Error(`Erro ao criar projeto: ${error.message}`);
        saved = data;
      }
    }

    writeLocalBackup(LOCAL_STORAGE_KEYS.PROJECTS, await this.getProjects(true));
    emitDataChanged('projects');
    return saved as Project;
  },

  async deleteProject(id: string): Promise<void> {
    const ownerId = await requireAuthenticatedOwner();
    if (!isUuid(id)) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);
    if (error) throw new Error(`Erro ao excluir projeto: ${error.message}`);

    writeLocalBackup(LOCAL_STORAGE_KEYS.PROJECTS, await this.getProjects(true));
    emitDataChanged('projects');
  },

  async getProjectBlocks(projectId: string): Promise<ProjectBlock[]> {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
    if (!isUuid(projectId)) return [];

    const { data, error } = await supabase
      .from('project_blocks')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Erro ao carregar blocos do Supabase: ${error.message}`);
    return (data || []) as ProjectBlock[];
  },

  async saveBlocks(projectId: string, blocks: ProjectBlock[]): Promise<ProjectBlock[]> {
    const ownerId = await requireAuthenticatedOwner();
    if (!isUuid(projectId)) throw new Error('Projeto ainda não possui um ID válido no Supabase.');

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('owner_id', ownerId)
      .limit(1)
      .maybeSingle();
    if (projectError) throw new Error(`Erro ao validar projeto: ${projectError.message}`);
    if (!project) throw new Error('Este projeto não pertence ao usuário autenticado.');

    const formatted = blocks.map((block, index) => ({
      project_id: projectId,
      type: block.type,
      content: block.content ?? '',
      media_url: block.media_url ?? '',
      alt_text: block.alt_text ?? '',
      caption: block.caption ?? '',
      transcript: block.transcript ?? '',
      display_order: index + 1,
    }));

    const { error: deleteError } = await supabase
      .from('project_blocks')
      .delete()
      .eq('project_id', projectId);
    if (deleteError) throw new Error(`Erro ao preparar atualização dos blocos: ${deleteError.message}`);

    let saved: ProjectBlock[] = [];
    if (formatted.length > 0) {
      const { data, error } = await supabase
        .from('project_blocks')
        .insert(formatted)
        .select('*');
      if (error) throw new Error(`Erro ao salvar blocos: ${error.message}`);
      saved = (data || []) as ProjectBlock[];
    }

    const backup = readLocalItem<Record<string, ProjectBlock[]>>(LOCAL_STORAGE_KEYS.BLOCKS) || {};
    backup[projectId] = saved;
    writeLocalBackup(LOCAL_STORAGE_KEYS.BLOCKS, backup);
    emitDataChanged('blocks');
    return saved;
  },

  async uploadFile(file: File, path: string): Promise<string> {
    const ownerId = await requireAuthenticatedOwner();
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const safeExtension = (extension || 'bin').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension}`;
    const filePath = `${ownerId}/${path}/${fileName}`;

    const { error } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw new Error(`Erro ao enviar arquivo para o Supabase Storage: ${error.message}`);

    const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error('O Supabase não retornou uma URL pública para o arquivo.');
    return data.publicUrl;
  },

  async migrateLegacyBrowserData(): Promise<LegacyRecoveryResult> {
    const ownerId = await requireAuthenticatedOwner();
    const snapshot = this.getLegacyBrowserSnapshot();
    const result: LegacyRecoveryResult = {
      settingsRecovered: false,
      categoriesRecovered: 0,
      projectsRecovered: 0,
      blocksRecovered: 0,
    };

    if (!snapshot.hasCustomData) return result;

    if (snapshot.settings && !isLegacyAiDefaultSettings(snapshot.settings)) {
      await this.updateSettings({
        ...snapshot.settings,
        id: undefined,
        owner_id: ownerId,
        theme_config: normalizeThemeConfig(snapshot.settings.theme_config),
      });
      result.settingsRecovered = true;
    }

    const projectsToRecover = snapshot.projects.filter((project) => !isExactDefaultProject(project));
    const referencedLegacyCategoryIds = new Set(
      projectsToRecover.map((project) => project.category_id).filter((id): id is string => Boolean(id)),
    );

    const remoteCategories = await this.getCategories();
    const remoteCategoryBySlug = new Map<string, Category>(remoteCategories.map((category) => [category.slug, category] as [string, Category]));
    const categoryIdMap = new Map<string, string>();

    for (const category of snapshot.categories) {
      const existing = remoteCategoryBySlug.get(category.slug);

      // Categorias demonstrativas intocadas nunca substituem uma categoria que já
      // esteja no Supabase. Só são criadas se um projeto autoral recuperado depender
      // delas e ainda não houver correspondente remoto.
      if (isExactDefaultCategory(category)) {
        if (existing) {
          categoryIdMap.set(category.id, existing.id);
          continue;
        }
        if (!referencedLegacyCategoryIds.has(category.id)) continue;
      }

      const saved = await this.saveCategory({
        name: category.name,
        slug: category.slug,
        description: category.description,
        display_order: category.display_order,
      });
      categoryIdMap.set(category.id, saved.id);
      remoteCategoryBySlug.set(saved.slug, saved);
      result.categoriesRecovered += 1;
    }

    const projectIdMap = new Map<string, string>();
    for (const project of projectsToRecover) {
      const saved = await this.saveProject({
        category_id: project.category_id ? (categoryIdMap.get(project.category_id) || null) : null,
        title: project.title,
        slug: project.slug,
        short_description: project.short_description,
        cover_image: project.cover_image,
        year: project.year,
        status: project.status,
        featured: project.featured,
        display_order: project.display_order,
      });
      projectIdMap.set(project.id, saved.id);
      result.projectsRecovered += 1;
    }

    for (const [legacyProjectId, legacyBlocks] of Object.entries(snapshot.blocks) as Array<[string, ProjectBlock[]]>) {
      const newProjectId = projectIdMap.get(legacyProjectId);
      if (!newProjectId || !legacyBlocks?.length) continue;
      await this.saveBlocks(newProjectId, legacyBlocks);
      result.blocksRecovered += legacyBlocks.length;
    }

    writeLocalBackup(LOCAL_STORAGE_KEYS.RECOVERY_DONE, true);
    emitDataChanged('legacy-recovery');
    return result;
  },
};
