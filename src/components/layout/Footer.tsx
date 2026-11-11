import React from 'react';

/**
 * Rodapé de autoria. Um único componente, usado por todas as páginas públicas
 * (Home, Projetos, Sobre, Contato e detalhe de projeto) — ver App.tsx.
 * Estilos em index.css (.ref-footer).
 */
export const Footer: React.FC = () => (
  <footer className="ref-footer">
    <p className="ref-footer__inner">
      <span className="ref-footer__star" aria-hidden="true">✦</span>
      <span>
        Desenvolvido por <span className="ref-footer__name">Ana Bocheneck</span>
      </span>
      <span className="ref-footer__star" aria-hidden="true">✦</span>
    </p>
  </footer>
);

export default Footer;
