import { defineConfig } from 'astro/config';

// https://astro.build/config
import analytics from "astro-analytics";

// https://astro.build/config
export default defineConfig({
  integrations: [analytics()]
});