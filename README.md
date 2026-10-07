# Desknotes

A local-first desktop notes app built with Tauri 2, Svelte 5, TypeScript, Tailwind CSS 4, and SQLite.

## Requirements

- Node.js 22.17+ (or 24+)
- Rust stable and Cargo
- The platform prerequisites for [Tauri 2](https://v2.tauri.app/start/prerequisites/)

## Development

```sh
npm install
npm run tauri dev
```

## Checks

```sh
npm run check
npm test
npm run build
```

The SQLite database (`desknotes.db`) is created in Tauri's app-config directory. Schema changes belong in ordered SQL files under `src-tauri/migrations/` and are registered in `src-tauri/src/lib.rs`.

## Project structure

- `src/lib/` — typed frontend data access and shared helpers
- `src/routes/` — SvelteKit single-page app screens
- `src-tauri/` — native Tauri configuration, capabilities, and migrations
- `src-tauri/migrations/` — versioned SQLite schema changes
