---
title: WIT Contract
order: 15
section: 'SDK Reference'
description: The WebAssembly Interface Types (WIT) contract that defines every Glyph extension, imports, exports, types, and version.
---

# WIT Contract

Every Glyph extension, JavaScript or Rust, implements the same WIT (WebAssembly Interface Types) contract. This page is the source of truth for what an extension can do. The JS SDK and the Rust bindings are both generated against this contract.

The current version is **`glyph:extension@0.1.0`**. The full `.wit` file lives in [`wit/glyph.wit`](https://github.com/your-org/novel/blob/main/wit/glyph.wit) (532 lines).

## World

```wit
world extension {
    import http;
    import host;
    import html;
    export source;
}
```

An extension **imports** three host-provided interfaces and **exports** a single `source` interface that the app calls.

## Imports, what the host provides

### `glyph:extension/http@0.1.0`

Synchronous HTTP. The host runs requests on a per-source `URLSession` with cookie isolation and domain restrictions.

```wit
interface http {
    fetch: func(req: request) -> response;
    record request { url: string, method: method, headers: list<tuple<string, string>>, body: option<string> }
    enum method { get, post }
    record response { status: u16, headers: list<tuple<string, string>>, body: string }
}
```

The SDK wraps this as `get(url)`, `post(url, body)`, `request(req)`, etc. See [HTTP & Requests](/docs/sdk-http).

### `glyph:extension/html@0.1.0`

Native HTML parsing (SwiftSoup on iOS). Faster than bundling a JS parser, and keeps bundle sizes small.

```wit
interface html {
    select-all: func(html: string, selector: string) -> list<element>;
    select-one: func(html: string, selector: string) -> option<element>;
    select-text: func(html: string, selector: string) -> list<string>;
    select-attr: func(html: string, selector: string, name: string) -> list<string>;
    select-html: func(html: string, selector: string) -> option<string>;
    record element { tag: string, text: string, attrs: list<tuple<string, string>>, inner-html: string }
}
```

The SDK wraps this as the jQuery-style `load(html)`. See [Helpers & Utilities](/docs/sdk-helpers).

### `glyph:extension/host@0.1.0`

Per-source host state, cookies, user agent, content rating.

```wit
interface host {
    get-cookies: func(url: string) -> list<tuple<string, string>>;
    set-cookie: func(url: string, name: string, value: string);
    get-default-user-agent: func() -> string;
    get-max-content-rating: func() -> content-rating;
    enum content-rating { everyone, teen, mature, adult }
}
```

## Exports, what the extension provides

Every method below lives on the exported `source` interface. The host calls them; you implement them.

### Required for all sources

```wit
get-source-type: func() -> source-type;          // 'reader' | 'download'
search-novels:   func(query: string, page: u32, filters: list<filter-value>) -> search-result;
fetch-novel-details: func(url: string) -> novel-details;
```

`createSource()` (JS) or the `Guest` trait (Rust) require these.

### Required for reader sources

```wit
fetch-chapter-content: func(url: string) -> option<chapter-content>;
```

Where `chapter-content` is a variant, either raw HTML or structured content blocks:

```wit
variant chapter-content {
    html(string),
    blocks(list<content-block>),
}
```

### Required for download sources

```wit
get-download-links: func(novel-url: string) -> option<download-info>;
```

### Optional

```wit
get-discover-sections:      func() -> option<list<discover-section>>;
get-discover-section-items: func(section-id: string, page: u32) -> option<discover-section-results>;
get-discover-items:         func(page: u32) -> option<search-result>;
fetch-chapters-list:        func(novel-url: string, page: u32) -> option<chapters-result>;
get-filters:                func() -> option<list<filter>>;
get-settings:               func() -> option<list<setting>>;
```

Implementing an optional method also auto-declares the corresponding capability. See [Capabilities](/docs/sdk-capabilities).

## Type reference (selected)

The full type set is large; these are the ones authors touch most often.

### Novel

```wit
record novel {
    id: string,
    title: string,
    url: string,
    cover: option<string>,
    author: option<string>,
    description: option<string>,
    tags: option<list<string>>,
    status: option<novel-status>,
    content-rating: option<content-rating>,
}
enum novel-status { ongoing, completed, hiatus, dropped, unknown }
```

### Chapter

```wit
record chapter {
    id: string,
    title: string,
    number: f64,             // float so 10.5 etc. work
    url: string,
    release-date: option<string>,   // ISO 8601 preferred
}
```

### Filter (search filters)

```wit
record filter {
    id: string,
    title: string,
    kind: filter-kind,
}
variant filter-kind {
    select(select-filter),
    multi-select(multi-select-filter),
    sort(sort-filter),
    check(check-filter),
}
```

### Filter value (what the user picked, passed to `search-novels`)

```wit
variant filter-value {
    select-value(select-filter-value),
    multi-select-value(multi-select-filter-value),
    sort-value(sort-filter-value),
    check-value(check-filter-value),
}
```

### Discover section

```wit
record discover-section {
    id: string,
    title: string,
    subtitle: option<string>,
    section-type: discover-section-type,
}
enum discover-section-type { featured, simple-carousel, chapter-updates, genres }
```

### Setting (per-source settings sheet)

```wit
record setting { id: string, title: string, kind: setting-kind, default-value: option<string> }
variant setting-kind { toggle, text, select(list<string>), password }
```

## Versioning

The contract version (`@0.1.0`) is embedded in every WIT module path. The SDK and CLI shim layers resolve to this exact version at build time. Mismatched versions between SDK and runtime are caught at extension load with a "bridge version mismatch" error.

Plans for upcoming versions:

| Version | Adds                                                      |
| ------- | --------------------------------------------------------- |
| 0.2     | Login handlers (basic + web/cookie), notification handler |
| 0.3     | Deep links, migration handlers, alternate covers          |
| 0.4     | Progress tracking, dynamic listings                       |
| 1.0     | Stable ABI, no more breaking changes                      |

Until 1.0, the contract is allowed to grow. **Adding new optional methods is non-breaking**; old extensions continue to work because the host treats absent methods as `none`. Adding required methods or changing existing signatures **is** breaking and bumps the version.

## Where to next

- Building a JS extension → [SDK Overview](/docs/sdk-overview), [Source Interface](/docs/sdk-source-interface)
- Building a Rust extension → [Rust Extensions](/docs/rust-extensions)
- Declaring what your source supports → [Capabilities](/docs/sdk-capabilities)
