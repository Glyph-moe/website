---
title: CLI Reference
order: 4
section: 'Building Extensions'
---

# CLI Reference

The Glyph CLI provides all the tools you need to create, develop, build, test, and validate extensions.

## Getting Started

Scaffold a new project:

```bash
npx create-glyph-extension my-extensions
cd my-extensions
npm run dev
```

The scaffolder asks for:

| Prompt              | Default            |
| ------------------- | ------------------ |
| Project name        | directory argument |
| First source ID     | _(required)_       |
| Source display name | _(required)_       |
| Language            | `en`               |
| Author              | git user.name      |
| GitHub repo URL     | _(optional)_       |

This creates a complete project with an example source, build config, test setup, and a dev server landing page.

## Commands

All commands are available via `npm run` scripts. Pass flags with `--`:

```bash
npm run dev                      # no flags
npm run dev -- --open            # with flags
```

### `glyph dev`

Start a development server with hot reload.

```bash
npm run dev
npm run dev -- --port 3000
npm run dev -- --open
```

| Option            | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `--port <number>` | Port number (default: 8888)                           |
| `--open`          | Open browser automatically                            |
| `--url <url>`     | Public base URL for tunnels (cloudflared, ngrok, etc) |

The dev server:

- Watches all sources for file changes
- Rebuilds automatically on save
- Picks up new sources added while running (via `glyph add` in another terminal)
- Serves `index.html`, bundles, and static files
- Prints all network interface URLs and deep links for iOS testing
- Auto-increments port if taken
- Accepts remote logs from the iOS app via a `/api/log` POST endpoint
- Includes a **Playground** for testing extension methods in the browser (see below)

**Interactive terminal commands:**

| Key | Action              |
| --- | ------------------- |
| `h` | Show help           |
| `r` | Restart all builds  |
| `u` | Show server URLs    |
| `q` | Quit the dev server |

### Playground

The dev server landing page includes an interactive playground below the sources list. It lets you test your extension methods directly in the browser, no iOS device needed.

**How it works:**

1. Select a source from the dropdown
2. Pick a method tab: Search, Novel Details, Chapter, or Discover
3. Enter the inputs (query, URL, etc.) and click Run
4. View results as a visual Preview or raw JSON

The playground executes your extension code on the server (not in the browser), making real HTTP requests to the target website. This means no CORS issues and identical behavior to the app.

**Navigation flow:** Results are clickable. Click a search result to load its novel details, click a chapter to read its content. This mirrors the app's navigation: browse → novel → chapter.

**Runs alongside iOS testing:** The deep link and sources list are still at the top of the page. You can test on your iPhone and in the playground at the same time.

### `glyph logcat`

Start a standalone log receiver server. The iOS app streams logs here when connected to a dev server.

```bash
npx glyph logcat
npx glyph logcat -p 3000
```

| Option                | Description                 |
| --------------------- | --------------------------- |
| `-p, --port <number>` | Port number (default: 9999) |

The server listens for log entries on HTTP and displays them in the terminal with timestamps and color-coded levels:

- **INFO** — blue
- **WARN** — yellow
- **ERROR** — red

Each entry includes a category tag so you can tell which source or subsystem produced it. This is the same log stream available through the `/api/log` endpoint in `glyph dev`, but as a dedicated process you can run in a separate terminal window.

### `glyph build`

Build all extensions for production.

```bash
npm run build
```

Creates optimized ESM bundles in `dist/`. For each source:

1. **JS sources:** Bundles with esbuild, validates, copies static assets
2. **Rust sources:** Builds with `cargo component`, transpiles with JCO
3. Generates `dist/index.json` with all sources

Progress is shown with listr2 spinners for each source. When the build finishes, you see the bundle size and timing for each source, plus the total build time. A `.metafile.json` file is written alongside each bundle for bundle analysis (compatible with [esbuild's bundle analyzer](https://esbuild.github.io/analyze/)).

Exits with code 1 if any source fails validation.

### `glyph test`

Run tests with vitest.

```bash
npm test
npm test -- --watch
npm test -- src/mysite.test.ts
npm test -- --generate
```

| Option       | Description                                             |
| ------------ | ------------------------------------------------------- |
| `--generate` | Scaffold test files for sources that don't have one yet |

Arguments after `--` are passed directly to vitest (except `--generate`, which is handled by the CLI). The CLI automatically injects the runtime test setup that provides WIT interface shims — no manual setup file needed in your project.

`--generate` creates a basic test file with the source imports and a placeholder test for each source missing a `.test.ts` file. Useful after adding several sources with `glyph add`.

### `glyph validate`

Validate all extension sources.

```bash
npm run validate
npm run validate -- --typecheck
npm run validate -- --tests
npm run validate -- --smoke
npm run validate -- --fix
npm run validate -- --ci
```

| Option        | Description                                          |
| ------------- | ---------------------------------------------------- |
| `--typecheck` | Run `tsc --noEmit` (requires typescript)             |
| `--tests`     | Run the test suite                                   |
| `--smoke`     | Run smoke test (calls `searchNovels` with real HTTP) |
| `--fix`       | Auto-fix fixable issues                              |
| `--ci`        | JSON output, non-interactive                         |

**Base validation** (always runs):

- Bundle builds successfully
- `info` object has all required fields: `id`, `name`, `version`, `baseUrl`, `icon`, `language`
- Required methods exist: `searchNovels`, `fetchNovelDetails`, `fetchChapterContent`

**Auto-fixable issues** (`--fix`):

- Missing `icon` → adds `${baseUrl}/favicon.ico`
- Missing `version` → adds `1.0.0`
- Missing `language` → adds `en`

**CI output** (`--ci`):

```json
{
  "passed": true,
  "sources": [{ "id": "mysite", "passed": true, "errors": [] }]
}
```

Default output uses listr2 progress spinners (falls back to plain text in CI mode):

```
Validating 2 source(s)...
  ✓ mysite
  ✗ othersite
    - info.icon is missing (fixable with --fix)
    - searchNovels() is not implemented

1 of 2 sources passed.
```

### `glyph add`

Add a new source to an existing project.

```bash
glyph add mysite                # TypeScript (default)
glyph add -l rust mysite        # Rust
```

| Option                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `-l, --language <lang>` | Extension language: `js` (default) or `rust` |

Prompts for:

| Prompt              | Default      |
| ------------------- | ------------ |
| Source display name | _(required)_ |
| Language            | `en`         |

Creates the full source directory structure:

**TypeScript:**

```
sources/mysite/
├── package.json
├── tsconfig.json
├── static/
└── src/
    ├── main.ts          # Skeleton with TODOs
    ├── parser.ts        # Empty parser class
    └── mysite.test.ts   # Test template
```

**Rust:**

```
sources/mysite/
├── Cargo.toml           # With [package.metadata.component] for WIT
├── source.json          # Extension metadata
├── static/
└── src/
    └── lib.rs           # Stub Guest implementation
```

### `glyph --version`

Print the CLI version.

## Error Messages

The CLI provides clear error messages when something is wrong:

| Situation                | Message                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| Not in a project         | `repo.json not found. Are you in a Glyph extension project?`          |
| No sources               | `No sources found in sources/. Run "glyph add <name>" to create one.` |
| Missing dependencies     | `Dependencies not installed. Run "npm install" first.`                |
| Source already exists    | `sources/mysite already exists.`                                      |
| TypeScript not installed | `typescript is required for --typecheck.`                             |
