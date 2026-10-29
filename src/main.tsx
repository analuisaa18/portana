import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RuntimeErrorBoundary } from './components/common/RuntimeErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RuntimeErrorBoundary><App /></RuntimeErrorBoundary>
  </StrictMode>,
);
