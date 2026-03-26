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
        // ============================================
        // CRITICAL: SPA NAVIGATION FALLBACK
        // ============================================
        // Serve index.html for all navigation requests (/*.*, not API routes)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          // Exclude API routes - do NOT serve index.html for these
          /^\/api\//,
          /^\/mission\/api\//,
          /^\/assets\//,
          /^\/models\//,
          /\.glb$/,
          /\.gltf$/,
          /\.json$/,
          /\.(?:png|jpg|jpeg|svg|gif|webp|mp4|mpeg|mp3|m4a|wav|webm)$/,
        ],

        // ============================================
        // RUNTIME CACHING STRATEGIES
        // ============================================
        runtimeCaching: [
          // 3D models: NetworkOnly - NEVER cache GLB to avoid stale blob URL issues
          {
            urlPattern: /\.glb$/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: '3d-models',
            },
          },
          // GLTF descriptor files - NetworkOnly
          {
            urlPattern: /\.gltf$/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'gltf-descriptors',
            },
          },
          // Images: StaleWhileRevalidate
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          // Audio/Video: CacheFirst
          {
            urlPattern: /\.(?:mp4|mpeg|mp3|m4a|wav|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],

        // ============================================
        // PRECACHE OPTIMIZATION
        // ============================================
        globPatterns: [
          '**/*.{js,css,html}',
          'favicon.ico',
          '**/*.svg',
          '**/*.{woff,woff2,ttf,eot}',
        ],

        globIgnores: [
          '**/node_modules/**/*',
          '**/.vite/**/*',
          '**/dist/**/*',
          '**/*.{jpg,jpeg,png,webp,avif}',
          '**/*.glb',
          '**/*.gltf',
          '**/*.mp4',
          '**/*.mpeg',
          '**/*.mp3',
          '**/*.m4a',
          '**/*.wav',
          '**/*.webm',
          '**/*.json',
        ],

        cleanupOutdatedCaches: true,
        skipWaiting: true,
      },
    }),
  ],
})
