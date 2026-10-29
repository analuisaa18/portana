import React from 'react';

type State = { error: Error | null };

/** Rede de segurança: erros em renderização ou efeitos não deixam uma página preta vazia. */
export class RuntimeErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Portfólio] Falha de renderização:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <main role="alert" style={{minHeight:'100vh', display:'grid', placeItems:'center',background:'#090909',color:'#fff',padding:'24px',fontFamily:'Arial,sans-serif'}}>
      <div style={{maxWidth:640,border:'1px solid #E388A9',borderRadius:12,padding:28}}>
        <h1 style={{fontSize:'1.5rem',margin:'0 0 12px',color:'#E388A9'}}>Não foi possível carregar o portfólio</h1>
        <p>Ocorreu um erro de execução na interface. Seus dados e projetos não foram alterados.</p>
        <button type="button" onClick={() => window.location.reload()} style={{padding:'12px 18px',cursor:'pointer',background:'#E388A9',color:'#090909',border:0,borderRadius:6,fontWeight:700}}>Recarregar página</button>
        <button type="button" onClick={() => { window.location.hash = '#home'; window.location.reload(); }} style={{padding:'12px 18px',cursor:'pointer',background:'transparent',color:'#fff',border:'1px solid #E388A9',borderRadius:6,fontWeight:700,marginLeft:12}}>Voltar ao início</button>
        <details style={{marginTop:20,fontSize:13,opacity:.9,overflowWrap:'anywhere'}}><summary>Detalhes técnicos para suporte</summary>
          <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.message}</pre>
        </details>
      </div>
    </main>;
  }
}
