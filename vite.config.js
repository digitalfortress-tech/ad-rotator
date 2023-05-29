/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve, dirname } from 'path';
import { defineConfig } from 'vite';

const __dirname = dirname(__filename);

module.exports = defineConfig({
  build: {
    target: 'es2020', // default is 'modules' which is a vite special value
    sourcemap: 'hidden',
    // minify: false,
    lib: {
      entry: resolve(__dirname, 'src/ad-rotator.ts'),
      name: 'rotator',
      fileName: (format) => `rotator.${format}.js`,
    },
  },
  server: {
    open: '/demo/index.html',
  },
});
