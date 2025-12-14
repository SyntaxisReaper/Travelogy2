import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/ui.css';
import 'leaflet/dist/leaflet.css';
import App from './App.simple';
import ErrorBoundary from './components/ErrorBoundary';
import { Provider } from 'react-redux';
import { store } from './store/store';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
