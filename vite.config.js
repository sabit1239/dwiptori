import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.jpg'],
      manifest: {
        name: 'Dwiptori — দ্বীপ তরী',
        short_name: 'Dwiptori',
        description: 'দ্বীপের বুকে প্রদীপ্ত তারুণ্য',
        theme_color: '#0369a1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'logo.jpg', sizes: '192x192', type: 'image/jpeg' },
          { src: 'logo.jpg', sizes: '512x512', type: 'image/jpeg' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-ui':       ['lucide-react', 'react-hot-toast'],
          'vendor-charts':   ['recharts'],
          'vendor-date':     ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
