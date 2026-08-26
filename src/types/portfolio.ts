export type UXVoice = 
  | 'direto' 
  | 'informal' 
  | 'poético' 
  | 'acadêmico' 
  | 'experimental' 
  | 'profissional' 
  | 'acolhedor' 
  | 'minimalista';

export type CtaLabel = 
  | 'Ver projeto' 
  | 'Explorar' 
  | 'Conhecer' 
  | 'Abrir projeto' 
  | 'Entrar' 
  | 'Descobrir';

export interface ThemeColors {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  focus: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypography {
  fontFamilyHeadings: string;
  fontFamilyBody: string;
  baseSizePx: number;
  scaleRatio: number;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
  headingLineHeight: number;
  letterSpacing: number;
}

export type IconProvider = 'material' | 'apple' | 'feather' | 'lucide' | 'custom';

export interface ThemeIcon {
  provider: IconProvider;
  name: string;
  url?: string;
  alt?: string;
}


export interface ThemeRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeLayout {
  maxWidthPx: number;
  gridColumns: number;
  gapPx: number;
  containerPaddingPx: number;
}

export interface ThemeMotion {
  durationFastMs: number;
  durationNormalMs: number;
  durationSlowMs: number;
  easing: string;
  reducedMotionFallback: boolean;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  layout: ThemeLayout;
  motion: ThemeMotion;
  brandIcon: ThemeIcon;
  customImage: string;
  ctaLabel: CtaLabel;
  uxVoice: UXVoice;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export interface PortfolioSettings {
  id?: string;
  owner_id?: string;
  portfolio_name: string;
  tagline: string;
  about_title: string;
  about_text: string;
  short_bio: string;
  profile_image: string;
  whatsapp: string;
  email_public: string;
  location: string;
  github_username?: string;
  social_links: SocialLink[];
  ux_voice: UXVoice;
  theme_config: ThemeConfig;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  owner_id?: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at?: string;
}

export type ProjectStatus = 'rascunho' | 'publicado';

export interface Project {
  id: string;
  owner_id?: string;
  category_id: string | null;
  title: string;
  slug: string;
  short_description: string;
  cover_image: string;
  year: number;
  status: ProjectStatus;
  featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  // Relationship helpers
  category?: Category;
  blocks?: ProjectBlock[];
}

export type BlockType = 'texto' | 'imagem' | 'video' | 'audio';

export interface ProjectBlock {
  id: string;
  project_id: string;
  type: BlockType;
  content: string;      // Used for markdown/text or video title or audio title
  media_url: string;    // Image URL, YouTube URL, Audio URL
  alt_text: string;     // Alt text for images
  caption: string;      // Subtitle / caption
  transcript: string;   // Text transcript for audio
  display_order: number;
  created_at?: string;
}
