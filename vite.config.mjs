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
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true, // Add source maps for better debugging
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background.js'),
        content: path.resolve(__dirname, 'src/content.js'),
        popup: path.resolve(__dirname, 'src/popup/popup.js'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        // Better chunk naming for modules
        chunkFileNames: 'modules/[name]-[hash].js',
        // For Chrome extensions, we want to bundle everything into single files
        // No manual chunks to avoid import issues in content scripts
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'icons', dest: '.' },
        { src: 'src/popup/popup.css', dest: 'popup' },
        { src: 'src/popup/popup.html', dest: 'popup' },
        { src: 'src/popup/inPagePopup.css', dest: 'popup' }, // Add the new CSS file
        { src: 'src/modules', dest: 'modules' }, // Copy modules directory
      ],
    }),
  ],
  // Optimize dependencies
  optimizeDeps: {
    include: [], // Add any external dependencies here if needed
  },
  // Development server configuration
  server: {
    port: 3000,
    open: false,
  },
}); 