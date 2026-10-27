# AI Studio preview smoke (Expo Router)

Minimal public Expo Router (SDK 54) app used to smoke-test the AI Studio secure
preview pipeline with a static, per-screen web preview. Contains no secrets.

`npm run build:preview` exports the web build and then runs
`scripts/preview-pages.mjs`, which makes the output work from the pipeline's
artifact path (`/artifacts/{deploymentId}/{digest}/`, exact files only):

- `app.config.js` bakes a placeholder base path into the export; the script turns
  it into relative URLs (HTML/JS via each page's `<base>`, CSS file-relative).
- One HTML page per screen in `.studio/design-screens.json`:
  `/` -> `index.html`, `/settings/profile` -> `settings/profile.html`. Each page
  carries `<base href>` (to the artifact root) and
  `<meta name="aistudio-preview-route">`.
- `metro.config.js` swaps two expo-router internals in preview web builds only:
  the entry passes the page's route to `ExpoRoot`, and linking is disabled, so the
  router never calls `history.pushState/replaceState` (the review bridge treats
  those as a document change). In-app navigation stays in memory.

`npm test` covers the post-build script.
