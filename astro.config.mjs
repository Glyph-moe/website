// @ts-check
import { defineConfig } from 'astro/config'
import netlify from '@astrojs/netlify'
import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import rehypeWrapTables from './src/plugins/rehype-wrap-tables.mjs'

export default defineConfig({
  build: {
    // Astro inlines a stylesheet only when its bundle is under ~4 kB and emits
    // a `<link>` for anything larger — a render-blocking request on exactly the
    // pages that carry the most CSS. `always` closes the whole class: every
    // route ships its rules in the document, so no route can wait on a
    // stylesheet before it paints.
    inlineStylesheets: 'always',
  },

  output: 'static',
  devToolbar: { enabled: false },
  // imageCDN: false — build AVIF/WebP/JPEG locally with sharp so the shipped
  // assets are static files with known byte sizes (no on-the-fly transform).
  adapter: netlify({ imageCDN: false }),
  site: 'https://glyph.moe',
  integrations: [
    mdx(),
    sitemap({
      filter: page => !page.includes('/template/'),
    }),
  ],
  markdown: {
    // Remark/rehype plugins belong to a processor now; `markdown.rehypePlugins`
    // still works but is deprecated and warns on every command.
    processor: unified({ rehypePlugins: [rehypeWrapTables] }),
    shikiConfig: {
      themes: {
        dark: 'github-dark-default',
        light: 'github-light-default',
      },
    },
  },
  vite: {
    build: {
      // Never inline a font. The @font-face rules ship twice — once live and
      // once inside <noscript> — so a base64 face would be duplicated with
      // them, and inlining any face measurably delayed the hero (see the perf
      // spec, decision D2).
      assetsInlineLimit: filePath => {
        if (/fonts\/.*\.woff2$/.test(filePath)) return false
        return undefined
      },
    },
  },
})
