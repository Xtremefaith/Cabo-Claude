import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initStore } from './store/storage';
import './index.css';

// Restore local data or a remembered group before/while the app renders.
void initStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
