import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.ico'],
      manifest: {
        name: 'SmartSales',
        short_name: 'SmartSales',
        description: 'Sistema inteligente de gestión comercial y ventas',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => {
              // Todas las URLs posibles del backend según client.ts
              return url.origin === 'https://smartsalesbackend.onrender.com' ||
                     url.origin === 'http://127.0.0.1:8000' ||
                     url.origin === 'https://daryl-draftable-overdogmatically.ngrok-free.dev' ||
                     url.pathname.startsWith('/api/')
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas (solo para offline)
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 30, // 🔥 30 segundos - esperará a la red
              fetchOptions: {
                cache: 'no-cache' // 🔥 NO usar caché HTTP del navegador
              }
            }
          },
          {
            urlPattern: ({ url }) => {
              // Imágenes desde cualquiera de los backends (prod, local, ngrok)
              const isBackendImage = (
                (url.origin === 'https://smartsalesbackend.onrender.com' || 
                 url.origin === 'http://127.0.0.1:8000' ||
                 url.origin === 'https://daryl-draftable-overdogmatically.ngrok-free.dev') &&
                /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)
              );
              const isLocalImage = /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname);
              return isBackendImage || isLocalImage;
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

});
