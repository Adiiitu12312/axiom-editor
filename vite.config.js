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
            name: 'CursusEditor',
            formats: ['es', 'cjs'],
            fileName: function (format) { return "cursus-editor.".concat(format === 'es' ? 'es.js' : 'cjs'); },
        },
        rollupOptions: {
            // Make sure to externalize deps that shouldn't be bundled into your library
            external: [
                'react',
                'react/jsx-runtime',
                'react-dom',
                'lucide-react',
                'dompurify',
                'tippy.js',
                'tiptap-extension-global-drag-handle',
                /^@tiptap\/.*/,
                /^prosemirror-.*/
            ],
            output: {
                // Provide global variables to use in the UMD build for externalized deps
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'lucide-react': 'LucideReact',
                    dompurify: 'DOMPurify',
                    'tippy.js': 'tippy'
                },
            },
        },
    },
});
