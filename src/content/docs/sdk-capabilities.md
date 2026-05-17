---
title: Capabilities
order: 17
section: 'SDK Reference'
description: Capability keys let the host know what your source supports without probing every optional method. Auto-detected for JS, manually declared for Rust.
---

# Capabilities

The capability system tells the iOS host what each extension can do, discover, filters, login, etc., by writing a small array into `dist/index.json` at build time. The app uses this to pre-filter sources and gate features without having to load the bundle into a WebView and probe every optional method.

## The six capability keys

| Key                  | Triggered by                                                                 | What it means                                                                |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `discover`           | both `getDiscoverSections` **and** `getDiscoverSectionItems` are implemented | Source has a curated discover layout (sections + items)                      |
| `discover-flat`      | `getDiscoverItems` is implemented                                            | Source has a flat paginated discover list (legacy / simple mode)             |
| `paginated-chapters` | `fetchChaptersList` is implemented                                           | Source serves chapters page-by-page (vs. all-at-once in `fetchNovelDetails`) |
| `filters`            | a non-empty `filters: [...]` array **or** `getFilters()` is implemented      | Source supports search filters                                               |
| `settings`           | `getSettings()` is implemented                                               | Source has a per-user settings sheet                                         |
| `login`              | `requiresLogin: true` is set on the source                                   | Source needs authentication (the app shows a login button)                   |

## How they're declared

### JavaScript, automatic

You don't declare anything. `createSource()` inspects the options you pass and attaches a `__capabilities` array as non-enumerable metadata on the source object. The CLI reads it at build time.

```typescript
export const source = createSource({
  id: 'mysite',
  // ...
  getDiscoverSections() {
    return [
      /* ... */
    ]
  },
  getDiscoverSectionItems(id, page) {
    return { items: [], hasNextPage: false }
  },
  filters: [
    {
      id: 'genre',
      title: 'Genre',
      kind: 'select',
      options: [
        /* ... */
      ],
    },
  ],
  requiresLogin: true,
})
//  → capabilities: ["discover", "filters", "login"]
```

### Rust, manual, in `source.json`

The WIT contract forces every method to be exported, so detection by method presence isn't possible for Rust. Declare what you actually support:

```json
{
  "id": "mysite",
  "capabilities": ["discover", "filters"]
}
```

If you forget, the host falls back to runtime probing of `typeof source.X === 'function'`, which is **broken for Rust extensions** because the `jco` wrapper always defines every method. **Always declare capabilities for Rust sources.**

See [Rust Extensions](/docs/rust-extensions) for the full Rust workflow.

## What `index.json` looks like

```json
{
  "sources": [
    {
      "id": "novelfire",
      "version": "1.4.1",
      "bundleUrl": "https://your-host/dist/novelfire.js",
      "capabilities": ["discover", "discover-flat", "paginated-chapters", "filters", "settings"]
    }
  ]
}
```

The field is **optional** for back-compat. Older builds don't have it; the host treats `capabilities` absent as "unknown, fall back to lazy detection". You can ship a new build with capabilities at any time without breaking older app versions.

## How the iOS app uses them

The host consults `source.capabilities` first, falling back to a runtime JS probe if the array is empty. Currently wired:

- `supportsPaginatedChapters`, gates the paged-chapter-list code path
- `supportsDiscover`, gates the curated discover page (vs. the flat fallback)

Planned (not yet wired):

- Capability badges in the Extensions list ("Filters", "Login required")
- Skipping `getFilters` / `getSettings` calls when the source doesn't support them, saves a WebView round-trip per source view

If you're shipping today, declare everything your source actually does. The data is forward-compatible, wiring it into more UI later doesn't require any changes from extension authors.

## Migration

Existing extensions inherit the right capabilities for free as soon as you rebuild against a current SDK + CLI:

- **JS:** rebuild with `npm run build`. `__capabilities` is computed by `createSource()` at runtime, so no code changes needed.
- **Rust:** add `capabilities` to your `source.json` and rebuild. The example crate at `glyph-rust-extension` is annotated with `["discover"]`.

There's no flag-day. Old `index.json` files without the field continue to work via the lazy fallback; new builds get the speed-up.

## Why not WIT-defined capabilities

A `get-capabilities()` method on the WIT interface was considered. The trade-off:

- WIT method: contract-clean, but requires loading the bundle + calling a method to learn capabilities → defeats the point of pre-filtering.
- Index.json field: pre-filterable from the manifest fetch alone, costs zero per-source work for JS authors, costs one JSON line for Rust authors.

The index.json approach won on ergonomics. The cost is that capabilities are a _build-time_ contract, not a _runtime_ one. If you change what your source supports, rebuild.

## See also

- [Source Interface](/docs/sdk-source-interface): the methods whose presence is detected
- [WIT Contract](/docs/wit-contract): the underlying interface
- [Rust Extensions](/docs/rust-extensions): manual declaration workflow
