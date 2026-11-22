import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import 'katex/dist/katex.min.css';
import App from './App.tsx';
import './index.css';

// Automatically register and update the offline service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
