import { defineConfig } from 'astro/config';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
    strictPort: true,
  },
  site: 'https://concrete.media/',
  integrations: [sitemap(), preact()],
  scopedStyleStrategy: "where",
  build: {
    inlineStylesheets: 'always',
  },
});