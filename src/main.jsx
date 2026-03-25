import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { GameProvider } from "./context/GameContext";

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.MODE === 'production' ? '/sw.js' : '/dev-sw.js', {
        scope: '/',
      })
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <GameProvider>
    <App />
  </GameProvider>
);
