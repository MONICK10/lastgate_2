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
        // Runtime caching strategies for dynamic assets
        runtimeCaching: [
          // 3D models: CacheFirst - serve from cache, fall back to network
          {
            urlPattern: /\.(?:glb|gltf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: '3d-models',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Images: StaleWhileRevalidate - serve cached, update in background
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Videos/Audio: CacheFirst - important for offline playback
          {
            urlPattern: /\.(?:mp4|mpeg|mp3|m4a|wav|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Game data: NetworkFirst - get latest game data
          {
            urlPattern: /\.json$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'game-data',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          // External API calls: NetworkFirst with fallback
          {
            urlPattern: /^https:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-calls',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
        // Precache only essential assets (small files)
        globPatterns: [
          '**/*.{js,css,html}',
          'favicon.ico',
          '**/*.svg', // SVG icons
          '**/*.{woff,woff2,ttf,eot}', // Fonts
        ],
        // Exclude large files from precache - let runtime caching handle them
        globIgnores: [
          '**/node_modules/**/*',
          '**/.vite/**/*',
          '**/dist/**/*',
          // Exclude all large images from precache
          '**/*.{jpg,jpeg,png,webp,avif}', // All raster images
          '**/*.glb', // Exclude 3D models
          '**/*.gltf', // Exclude 3D model descriptors
          '**/*.mp4', // Exclude videos
          '**/*.mpeg', // Exclude videos
          '**/*.mp3', // Exclude audio
          '**/*.m4a', // Exclude audio
          '**/*.wav', // Exclude audio
          '**/*.webm', // Exclude videos
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
      },
    }),
  ],
})
