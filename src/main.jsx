import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Use ReactDOM.createRoot to render your app
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);