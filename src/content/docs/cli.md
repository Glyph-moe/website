---
title: CLI Reference
order: 4
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

| Option            | Description                 |
| ----------------- | --------------------------- |
| `--port <number>` | Port number (default: 8888) |
| `--open`          | Open browser automatically  |

The dev server:

- Watches all sources for file changes
- Rebuilds automatically on save
- Picks up new sources added while running (via `glyph add` in another terminal)
- Serves `index.html`, bundles, and static files
- Prints your LAN IP and deep link for iOS testing
- Auto-increments port if taken
- Includes a **Playground** for testing extension methods in the browser (see below)

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

### `glyph build`

Build all extensions for production.

```bash
npm run build
```

Creates optimized, minified IIFE bundles in `dist/`. For each source:

1. Bundles with esbuild (includes SDK and polyfills)
2. Validates the bundle (info fields, required methods)
3. Copies static assets
4. Generates `dist/index.json`

Exits with code 1 if any source fails validation.

### `glyph test`

Run tests with vitest.

```bash
npm test
npm test -- --watch
npm test -- src/mysite.test.ts
```

Arguments after `--` are passed directly to vitest. The CLI automatically injects the runtime test setup that mocks the iOS globals (`Application`, etc.) — no manual setup file needed in your project.

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

Default output:

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
glyph add mysite
```

Prompts for:

| Prompt              | Default      |
| ------------------- | ------------ |
| Source display name | _(required)_ |
| Language            | `en`         |

Creates the full source directory structure:

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
