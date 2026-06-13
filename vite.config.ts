import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ 
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AxiomEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `axiom-editor.${format === 'es' ? 'es.js' : 'cjs'}`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled into your library
      external: [
        'react', 
        'react/jsx-runtime',
        'react-dom', 
        'lucide-react',
        'dompurify',
        /^highlight\.js.*/,
        'lowlight',
        'tippy.js',
        'tiptap-extension-global-drag-handle',
        /^@tiptap\/.*/,
        /^prosemirror-.*/,
        /^y-.*/,
        'yjs'
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'LucideReact',
          dompurify: 'DOMPurify',
          'highlight.js': 'hljs',
          lowlight: 'lowlight',
          'tippy.js': 'tippy'
        },
      },
    },
  },
});
 
  