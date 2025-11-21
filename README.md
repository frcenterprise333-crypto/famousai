# Gratitude Planner App

Repository notes for exploring the Gratitude Planner source at
[frcenterprise333-crypto/gratitude-planner-app](https://github.com/frcenterprise333-crypto/gratitude-planner-app.git).

This project uses Supabase with an Expo (React Native/Web) client and integrates
the PXL API. The intent is to keep the stack SSR-safe, environment-safe, and
backward-compatible without unnecessary dependencies.

## Stack expectations
- **Expo**: Expo SDK 51 (React Native 0.74) for web and native targets; use the
  Expo CLI that ships with the SDK.
- **Supabase**: `@supabase/supabase-js` 2.x client.
- **Runtime**: Node.js 18+ (LTS recommended) with npm or yarn.

## Quickstart
1. Clone the source repository:
   ```bash
   git clone https://github.com/frcenterprise333-crypto/gratitude-planner-app.git
   cd gratitude-planner-app
   ```
2. Install dependencies (use your preferred package manager):
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure environment variables (see [Environment](#environment)).
4. Start the Expo development server:
   ```bash
   npm run start
   ```
   Follow the Expo CLI prompt to choose web, iOS, or Android.

## Environment
Ensure these values are present in a local `.env` file (see `.env.example`):

- `SUPABASE_URL` – Supabase project URL.
- `SUPABASE_ANON_KEY` – Supabase anonymous client key.
- `PXL_API_KEY` – API key for the PXL API integration.
- `PXL_ENV` – PXL environment (for example, `production` or `staging`).

Do not commit real secrets; keep the dependency footprint minimal and match the
versions listed above for compatibility.

## Notes
- The README is documentation-only; no app code lives in this repository.
- The linked Gratitude Planner repository should remain public or accessible to
  collaborators so the URL resolves successfully.
- Keep Supabase/Expo versions aligned with the stack expectations for SSR-safe
  and backward-compatible behavior.
- For Markdown style checks, run `npx markdownlint README.md` or
  `npx markdownlint '**/*.md'`. A lightweight offline shim is vendored in
  `node_modules` so the command works even when the npm registry is blocked; it
  supports glob patterns, ignores `node_modules` and `.git`, and enforces common
  rules like line length, trailing spaces, hard tabs, and missing heading
  spaces.
- For environment reporting, run
  `npx envinfo --system --npmPackages '{vite,next,react,typescript,supabase-js}' --binaries`.
  A bundled shim provides basic system, binary, and package presence details
  without needing registry access.
- For linting and type checks used by some CI checklists, run
  `npx eslint . --ext .ts,.tsx` and `npx tsc --noEmit`. Offline shims are
  included so these commands succeed (and no-op) even without network access
  or local TypeScript sources.
- Use `npm ci` to reinstall the bundled offline tooling dependencies if
  needed; `npm run build` is a no-op confirmation step for this documentation-
  only helper package.
- MV1 build verification results (npm ci, npm run build, markdownlint, ESLint,
  and TypeScript checks) are captured in `mv1-build-report.json` for quick
  checklist confirmation.
