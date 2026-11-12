import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages site on the custom domain https://hoangle.online/ (see public/CNAME)
export default defineConfig({
  site: 'https://hoangle.online',
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
