import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Hawkins Protocol',
        short_name: 'Hawkins',
        description: 'Hawkins Protocol - Offline capable network learning game',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offline-cache',
              expiration: {
                maxEntries: 200,
              },
            },
          },
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,woff,woff2,ttf,eot}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 10000000, // 10MB per file
      },
    }),
  ],
})
