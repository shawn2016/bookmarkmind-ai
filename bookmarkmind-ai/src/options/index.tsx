import React from 'react';
import ReactDOM from 'react-dom/client';
import '@shared/styles/tokens.css';
import '@shared/styles/global.css';
import './styles/options.css';
import App from './App';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
