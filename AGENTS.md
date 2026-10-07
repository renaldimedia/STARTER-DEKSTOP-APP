# Agent instructions

## Stack and architecture

- This is a Tauri 2 desktop app. Keep the frontend as a SvelteKit static SPA (`ssr = false`) built by Vite; do not add a Node server or browser-only fallback for native features.
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) and TypeScript. Keep UI in `src/routes/` and reusable data/types/helpers in `src/lib/`, imported via SvelteKit's `#lib/*.js` subpath alias.
- Use Tailwind CSS 4 utilities for styling. Shared global styles belong in `src/app.css`.
- SQLite is provided by `tauri-plugin-sql`. Frontend database access belongs in typed functions under `src/lib/`; use bound SQL parameters for all data values.
- Store schema changes as ordered, forward-only SQL migrations in `src-tauri/migrations/` and register each migration in `src-tauri/src/lib.rs`. Do not edit an already-released migration to change schema.
- Keep Tauri permissions least-privilege in `src-tauri/capabilities/`. Add permissions only for APIs the app actually uses.
- Keep the Tauri content security policy restrictive; add network origins only when the app has a clear need for them.

## Conventions

- Prefer small, focused modules and descriptive kebab-case filenames.
- Keep components accessible: semantic elements, labels, visible focus states, and useful accessible names.
- Surface asynchronous failures to the user; do not silently swallow database or native errors.
- Keep secrets and machine-specific files out of source control.
- Update `README.md` when setup, scripts, or project architecture change.

## Validation

- Run `npm run check` for Svelte and TypeScript diagnostics.
- Run `npm test` for unit tests.
- Run `npm run build` to verify the production frontend.
- When changing Rust or Tauri configuration, also run `cargo check --manifest-path src-tauri/Cargo.toml`.
- Add or update tests for new shared logic and bug fixes.
