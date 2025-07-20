/**
 * Vite configuration for the Unriddle Chrome Extension
 * 
 * This configuration is optimized for Chrome extension development with:
 * - Single-file bundling for content scripts
 * - Source maps for debugging
 * - Static asset copying
 * - Development server setup
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js'),
        popup: resolve(__dirname, 'src/popup/popup.js'),
        settings: resolve(__dirname, 'src/settings/settings.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Put settings.js in the settings directory
          if (chunkInfo.name === 'settings') {
            return 'settings/[name].js';
          }
          // Put popup.js in the popup directory
          if (chunkInfo.name === 'popup') {
            return 'popup/[name].js';
          }
          return '[name].js';
        },
        assetFileNames: '[name][extname]',
        // Disable code splitting for all entry points
        manualChunks: undefined
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        },
        {
          src: 'src/popup/popup.html',
          dest: 'popup'
        },
        {
          src: 'src/popup/popup.css',
          dest: 'popup'
        },
        {
          src: 'src/popup/inPagePopup.css',
          dest: 'popup'
        },
        {
          src: 'src/settings/settings.html',
          dest: 'settings'
        },
        {
          src: 'src/settings/settings.css',
          dest: 'settings'
        },
        {
          src: 'icons',
          dest: '.'
        }
      ]
    })
  ]
}); 