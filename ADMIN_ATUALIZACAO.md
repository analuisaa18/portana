Ampliação do Admin — Portana / portfólio autoral
Escopo incorporado
O projeto continua sendo Vite + React e utiliza as mesmas rotinas de banco de dados,
autenticação e arquivos do código recebido. O código novo reaproveita
`portfolioStore.updateSettings`, `saveProject`, `saveBlocks` e `uploadFile`.
Novas seções do Admin
Conteúdo: campos separados por Home, Sobre, Projetos, Contato e Rodapé;
prévia em linha, salvar/cancelar e aviso de alterações não salvas.
Imagens: colagens desktop/mobile, camadas de fundo das páginas e foto da
página Sobre; prévia, URL, upload e restauração da imagem original.
Projetos: manutenção das ações existentes, incluindo capas, galeria com blocos
de imagens e ordem de blocos; nova ação de duplicação com blocos em rascunho.
Navbar: nome e ordem dos links existentes, visibilidade, altura, tamanhos
e espaçamento diferenciados para desktop e mobile; prévia instantânea.
Tipografia: catálogo oficial do Google Fonts (quando configurado), pesquisa,
papéis tipográficos, pesos, tamanhos, entrelinha e prévia.
Interações p5.js: os sketches de projetos já editados como `project_blocks.type='p5'`
passam a aparecer em iframe com sandbox. O Admin permite ligar/desligar os
sketches, permitir/bloquear ponteiro e controlar altura. Os parâmetros internos
de física, partículas ou velocidade variam entre sketches e não podem ser
inferidos genericamente a partir de código JavaScript arbitrário.
Contato: número, mensagem inicial, texto do botão, exibição do WhatsApp,
e-mail, localização e links já cadastrados, com ordem e visibilidade.
Mapeamento dos dados: sem mudanças no Supabase
Dado	Onde já existia / onde permanece
Conteúdo configurável	`portfolio_settings.theme_config.content` (JSON existente)
Imagens de páginas	`portfolio_settings.theme_config.media` (JSON existente)
Navbar	`portfolio_settings.theme_config.navigation` (JSON existente)
Tipografia	`portfolio_settings.theme_config.typography` (JSON existente)
Contato WhatsApp	`portfolio_settings.whatsapp` + `theme_config.contact`
Links	`portfolio_settings.social_links` (mesma coleção existente)
Controles p5.js	`portfolio_settings.theme_config.p5` (JSON existente)
Projetos	tabela `projects` (existente)
Imagens dos projetos e código de sketches	tabela `project_blocks` (existente)
Upload de mídia	bucket `portfolio-media` (existente)
Nenhuma migração SQL é fornecida. As novas chaves são opcionais dentro do JSON
`theme_config`; o normalizador preserva os dados de versões anteriores e aplica
valores padrão em campos ausentes. A visualização usa os assets originais até
que um substituto seja salvo.
Configuração Google Fonts API
A consulta da lista de famílias usa a API oficial em `api/google-fonts.ts`.
Na Vercel, definir `GOOGLE_FONTS_API_KEY` como variável de ambiente
do servidor (sem `VITE_`) para que a chave não seja publicada no bundle JS.
Crie essa chave na plataforma Google Cloud com a API Google Fonts habilitada.
Sem a variável, a seção de tipografia tenta ler o catálogo público espelhado
pelo projeto Fontsource e exibe essa condição. A renderização das famílias
selecionadas usa o CSS público do Google Fonts.
`vite dev` não executa funções serverless em `/api` localmente; a consulta
oficial funciona no deploy na Vercel ou em um ambiente compatível de funções.
Comportamento p5.js
Sketches continuam em JavaScript/p5.js (nenhuma substituição de tecnologia).
Os blocos têm código próprio e são executados em `iframe` isolado sem acesso ao
DOM ou aos cookies da página principal. O download da biblioteca p5.js requer
acesso externo ao CDN. Para modificar o código de um sketch, editar o respectivo
projeto em Projetos > Blocos de conteúdo > p5.js.
Implantação
Fazer backup do projeto original e dos dados de produção.
Substituir/adicionar os arquivos recebidos no repositório.
Na Vercel, adicionar `GOOGLE_FONTS_API_KEY` para a consulta oficial.
Manter todas as variáveis Supabase existentes sem alteração.
Compilar e testar no ambiente com credenciais reais, inclusive RLS e bucket.
Validar save → leitura → reload com uma conta administrativa autorizada.
Limitações e observações
Os controles p5.js não conseguem descobrir automaticamente parâmetros
específicos de cada sketch; isso exige adaptar explicitamente cada sketch.
A exibição/edição de projeto e uploads aproveitam as rotas existentes, mas a
integridade e exclusão em cascata continuam dependendo das regras já instaladas
no Supabase. Nenhuma política de acesso foi modificada.
A API oficial depende de uma chave de Google Fonts fornecida pelo responsável;
não é possível validar o endpoint autenticado sem ela.
Não foram executados testes de persistência reais na conta de produção: as
credenciais e a sessão administrativa não constavam dos arquivos enviados.
