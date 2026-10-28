/** Catálogo oficial Google Fonts; roda na função de servidor Vercel.
 * Configure GOOGLE_FONTS_API_KEY (sem o prefixo VITE_); a chave nunca chega ao browser.
 * Não modifica a persistência ou a autenticação do Supabase.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return Response.json({error:'Método não permitido'}, {status:405});
    const apiKey = process.env.GOOGLE_FONTS_API_KEY;
    if (!apiKey) return Response.json({error:'GOOGLE_FONTS_API_KEY não configurada'}, {status:503});
    try {
      const result = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=${encodeURIComponent(apiKey)}`);
      if (!result.ok) return Response.json({error:'Erro na Google Fonts API',status:result.status},{status:502});
      const data = await result.json() as {items?:Array<{family:string;variants:string[]}>};
      return Response.json({items:(data.items || []).map(({family,variants})=>({family,variants}))},
        {headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=86400'}});
    } catch { return Response.json({error:'Google Fonts API indisponível'}, {status:502}); }
  },
};
