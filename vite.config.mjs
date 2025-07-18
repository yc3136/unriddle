import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background.js'),
        content: path.resolve(__dirname, 'src/content.js'),
        popup: path.resolve(__dirname, 'src/popup/popup.js'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
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
      ],
    }),
  ],
}); 