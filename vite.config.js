import { resolve } from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'es2020', // default is 'modules' which is a vite special value
    sourcemap: 'hidden',
    lib: {
      entry: resolve(import.meta.dirname, 'src/ad-rotator.ts'),
      name: 'rotator',
      fileName: (format) => `rotator.${format}.js`,
    },
  },
  server: {
    open: '/demo/index.umd.html',
  },
  // This emits a types.d.ts within the dist/ folder
  // plugins: [dts({ rollupTypes: true })],
});
