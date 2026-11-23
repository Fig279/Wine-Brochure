import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    allowedHosts: [
      'mendoza-brochure-0a88da453a1d.herokuapp.com',
      '.herokuapp.com'
    ]
  }
});