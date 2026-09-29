import React from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (no external requests)
import '@fontsource/montserrat/900-italic.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
