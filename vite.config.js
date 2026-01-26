import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    },
    optimizeDeps: {
        include: ['d3', 'd3-org-chart', 'yjs', 'y-websocket', 'y-indexeddb']
    }
});
