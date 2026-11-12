import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://hoangnhatduyle.github.io/portfolio/
export default defineConfig({
  site: 'https://hoangnhatduyle.github.io',
  base: '/portfolio',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    // Keep scripts/styles as files so the meta CSP can stay strict ('self').
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
