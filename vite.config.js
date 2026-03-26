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
          /^\/api\//,      // /api/* routes
          /^\/mission\/api\//,  // /mission/api/* if you have an API there
          /\.[a-z]+$/i,    // Any file extension (.js, .json, .png, etc)
        ],

        // ============================================
        // RUNTIME CACHING STRATEGIES
        // ============================================
        runtimeCaching: [
          // 3D models: CacheFirst - but ONLY for .glb that don't have embedded textures
          // For models with textures, use NetworkFirst to avoid blob URL issues
          {
            urlPattern: /\.glb$/i,
            handler: 'NetworkFirst',  // Changed from CacheFirst to avoid blob URL stale state
            options: {
              cacheName: '3d-models',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // GLTF descriptor files - always NetworkFirst (these reference external textures)
          {
            urlPattern: /\.gltf$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gltf-descriptors',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 10,
              },
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
          // Game JSON data: NetworkFirst with short timeout to fail fast
          {
            urlPattern: /\.json$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'game-data',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24,
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
        ],

        cleanupOutdatedCaches: true,
        skipWaiting: true,
      },
    }),
  ],
})
