Validação da atualização administrativa
Data: 28/10/2026
Confirmado por testes estáticos automatizados
PASSOU: 61 arquivos TypeScript/TSX (incluindo função da Vercel) analisados pelo compilador TypeScript sem erros sintáticos.
PASSOU: o normalizador de `theme_config` aceita configuração antiga e preenche as novas seções sem apagar nome, textos, cor, links e propriedades já salvos.
PASSOU: valores explícitos como `false` continuam `false` na normalização.
PASSOU: os novos editores são importados e renderizados pelo painel administrativo.
PASSOU: os componentes públicos consomem os conteúdos administráveis.
PASSOU: `src/services/store.ts` e `src/lib/supabase.ts` são byte a byte idênticos aos do ZIP original (sem alterações de conexão, autenticação, métodos de persistência, owner IDs, sincronização ou upload).
PASSOU: `supabase/schema.sql` e o projeto existente não receberam migrações.
Não foi possível validar neste ambiente
`npm run build` / `npm run lint`: sem dependências npm instaladas. A tentativa de instalação não se concluiu no ambiente isolado. A checagem de tipos com TypeScript global não mostrou novos erros de código depois de excluir erros de dependências externas ausentes.
Login real, RLS, escrita/leitura e recarga em Supabase de produção: não havia sessão nem credenciais válidas fornecidas com o ZIP.
Envio real de imagens ao bucket: depende da sessão e das políticas do projeto.
Catálogo completo da API oficial: depende da variável de servidor `GOOGLE_FONTS_API_KEY` e da Vercel.
Renderização visual pixel a pixel, navegação efetiva em mobile e `p5.js` com dados reais: dependem de execução com as dependências instaladas e conteúdo do banco.
Roteiro para a validação final na Vercel
Fazer login em `#admin` e guardar backup dos valores atuais.
Editar Home → Salvar → visitar `#home` → recarregar → conferir.
Alterar uma colagem → Salvar → recarregar → verificar a imagem.
Criar e duplicar projeto (com imagens) → conferir ordem, blocos e persistência.
Editar a Navbar e comparar desktop/mobile antes e após salvar.
Buscar fonte na Google Fonts API, salvar e recarregar.
Criar um sketch p5.js em um projeto, salvar, visualizar e desativar no Admin.
Configurar WhatsApp e testar URL `wa.me` com número e mensagem reais.
Ocultar e reordenar os links do menu/rodapé, salvar e recarregar.
Confirmar que todo o conteúdo anterior no Supabase segue disponível.
O build e a validação ponta a ponta não devem ser considerados concluídos até que esses itens sejam testados no ambiente implantado.
