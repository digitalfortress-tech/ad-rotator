import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log('task log >> ', message);
          return null;
        },
      });
    },
  },
});
