import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { GameProvider } from "./context/GameContext";

// Service Worker Registration for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', {
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
