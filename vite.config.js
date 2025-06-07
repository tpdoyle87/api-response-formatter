import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        try {
          // Copy manifest
          copyFileSync('manifest.json', 'dist/manifest.json');
          
          // Copy popup.html to root
          if (existsSync('dist/src/popup/popup.html')) {
            copyFileSync('dist/src/popup/popup.html', 'dist/popup.html');
          }
          
          // Icons should be generated separately
          mkdirSync('dist/icons', { recursive: true });
        } catch (e) {
          console.error('Failed to copy files:', e);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.css') {
            return 'popup.css';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
});