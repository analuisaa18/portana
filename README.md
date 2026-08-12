# PORTFÓLIO PESSOAL AUTORAL

Um sistema completo de Portfólio Pessoal e Gestão Autoral desenvolvido com **React 19**, **TypeScript**, **Tailwind CSS v4** e **Supabase** (Database, Auth, Storage e RLS).

---

## 1. OBJETIVO DO PROJETO

Infraestrutura autoral que permite cadastrar e organizar projetos por categorias, estruturar narrativas visuais por meio de blocos sequenciais de conteúdo (Textos, Imagens, Vídeos do YouTube e Áudios com transcrição), editar informações de perfil e controlar todo o Design System (Cores, Tipografia, Cantos, Grid e Tom de Voz) com verificação em tempo real de conformidade WCAG 2.2 AA.

---

## 2. ARQUITETURA DE DADOS & TECNOLOGIAS

- **Front-end**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide React Icons.
- **Back-end & Persistência**: Supabase Client (`@supabase/supabase-js`), Supabase Auth, Row Level Security (RLS) e Supabase Storage (`portfolio-media`).
- **Resiliência / Local Storage Fallback**: O aplicativo conta com sincronização dupla: opera nativamente com Supabase quando configurado e possui fallback transparente para LocalStorage, garantindo que os dados inseridos no painel nunca desapareçam em recarregamentos de página mesmo sem credenciais do Supabase ativas.

---

## 3. BANCO DE DADOS & SCHEMAS (SUPABASE)

As tabelas criadas no arquivo `supabase/schema.sql` incluem:

1. `portfolio_settings`: Guarda nome do portfólio, tagline, foto de perfil, bio, sobre, WhatsApp, e-mail público, localização, redes sociais e configurações do Design System (`theme_config`).
2. `categories`: Categorias autorais (ex: Design de Interfaces, Editorial, Audiovisual, Pesquisa) com ordenação e slug.
3. `projects`: Projetos do acervo com título, slug, categoria, capa, ano, status (`rascunho` / `publicado`), destaque e ordenação.
4. `project_blocks`: Blocos encadeados do projeto (`texto`, `imagem`, `video`, `audio`) com suporte a `alt_text` e transcrições textuais.

### Políticas de Segurança RLS (Row Level Security)

- **Visitantes**: Acesso apenas de leitura para configurações, categorias, projetos marcados como `publicado` e seus respectivos blocos.
- **Administrador**: Acesso total de inserção, alteração e deleção (`ALL`) apenas para o proprietário autenticado (`auth.uid() = owner_id`).

---

## 4. INSTALAÇÃO E EXECUÇÃO LOCAL

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev
```

---

## 5. VARIÁVEIS DE AMBIENTE (`.env`)

Crie o arquivo `.env` baseado no `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica"
```

---

## 6. ACESSIBILIDADE DIGITAL (WCAG 2.2 AA)

- **HTML Semântico**: Utilização rigorosa de `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<figure>`, `<figcaption>` e `<footer>`.
- **Navegação por Teclado**: Foco visível preservado com anel de alto contraste (`outline: 3px solid var(--color-focus)`).
- **Atalho de Salto**: Skip Link ("Pular para o conteúdo principal") disponível para usuários de leitores de tela.
- **Auditoria de Contraste Automática**: Painel "Aparência" inclui verificador matemático que calcula a razão de luminância dos tokens de cor e avisa caso alguma combinação fique abaixo de 4.5:1.
- **Transcrição de Áudio e Alt Text**: Áudios possuem acordeão com transcrição integral e imagens exigem texto alternativo.
- **Suporte a Reduced Motion**: Animações e transições respeitam a preferência do sistema (`prefers-reduced-motion`).

---

## 7. ACESSO ADMINISTRATIVO DE DEMONSTRAÇÃO

Acesse a rota de administração clicando em **"Admin"** no cabeçalho:
- **Código de Acesso Rápido**: Digite `admin123` para entrar no painel.
