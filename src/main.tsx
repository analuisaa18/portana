import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary area="o portfólio" onReset={() => { window.location.hash = '#/'; }} resetLabel="Ir para o início">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
