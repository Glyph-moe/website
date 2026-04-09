// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  site: 'https://glyph.moe',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        dark: 'github-dark-default',
        light: 'github-light-default',
      },
    },
  },
});
