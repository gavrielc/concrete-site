import { defineConfig } from 'astro/config';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
import preact from "@astrojs/preact";

// Clients, team and coverage content comes from Sanity at build time
import cmsContent from "./src/lib/cms.mjs";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
    strictPort: true,
  },
  site: 'https://concrete.media/',
  // home-scroll is a design preview for the customer, kept out of the sitemap.
  integrations: [sitemap({filter: (page) => !page.includes('/home-scroll')}), preact()],
  scopedStyleStrategy: "where",
  vite: {
    plugins: [cmsContent()],
  },
  build: {
    inlineStylesheets: 'always',
  },
});