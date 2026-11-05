import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Texto curto do contexto ("o portfólio", "o painel administrativo"). */
  area?: string;
  /** Ação opcional além de recarregar (ex.: voltar ao site). */
  onReset?: () => void;
  resetLabel?: string;
}

interface ErrorBoundaryState { error: Error | null }

/**
 * Rede de segurança: um erro de renderização vira uma mensagem com botão de recarregar,
 * em vez de uma tela preta vazia. Também cobre a falha de baixar o painel (lazy) depois
 * de um novo deploy — nesse caso recarregar resolve.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  declare setState: (state: ErrorBoundaryState) => void;
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Portfólio] Erro em ${this.props.area || 'interface'}:`, error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isChunkError = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(error.message);
    return (
      <div role="alert" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#090909', color: '#fff', padding: 24, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: 560, border: '1px solid #ec83aa', borderRadius: 14, padding: 28 }}>
          <h1 style={{ fontSize: 22, margin: '0 0 12px', color: '#ec83aa' }}>
            Não foi possível abrir {this.props.area || 'esta página'}
          </h1>
          <p style={{ margin: '0 0 20px', lineHeight: 1.5, fontSize: 14 }}>
            {isChunkError
              ? 'O site foi atualizado enquanto esta aba estava aberta. Recarregue para baixar a versão nova.'
              : 'Aconteceu um erro na interface. Nenhum dado foi alterado.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button type="button" onClick={() => window.location.reload()}
              style={{ padding: '11px 18px', cursor: 'pointer', background: '#ec83aa', color: '#090909', border: 0, borderRadius: 6, fontWeight: 700 }}>
              Recarregar
            </button>
            {this.props.onReset && (
              <button type="button" onClick={this.reset}
                style={{ padding: '11px 18px', cursor: 'pointer', background: 'transparent', color: '#fff', border: '1px solid #ec83aa', borderRadius: 6, fontWeight: 700 }}>
                {this.props.resetLabel || 'Voltar'}
              </button>
            )}
          </div>
          <details style={{ marginTop: 18, fontSize: 12, opacity: 0.8 }}>
            <summary style={{ cursor: 'pointer' }}>Detalhes técnicos</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{error.message}</pre>
          </details>
        </div>
      </div>
    );
  }
}
