import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://apple-silicon-lab.pages.dev',
  integrations: [
    react(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff,woff2,json}'],
        navigateFallback: '/',
      },
      manifest: {
        name: 'Apple Silicon Lab - チップ性能完全比較',
        short_name: 'Silicon Lab',
        description: 'Apple M1〜M5 / A15〜A19チップの性能・ベンチマーク完全比較サイト',
        theme_color: '#0071e3',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});

