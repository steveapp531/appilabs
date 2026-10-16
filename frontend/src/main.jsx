import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/public-sans';
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import App from './App.jsx';
import { DataProvider } from './lib/data.jsx';

const container = document.getElementById('root');
const initial = window.__APL_DATA__ || {};
const tree = (
  <StrictMode>
    <HelmetProvider>
      <DataProvider initial={initial}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataProvider>
    </HelmetProvider>
  </StrictMode>
);

// Prerendered pages are hydrated. The SPA fallback (admin, unknown routes) renders from scratch.
if (container.hasChildNodes()) hydrateRoot(container, tree);
else createRoot(container).render(tree);
