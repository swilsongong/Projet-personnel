# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quickstart: run locally

This is a static site (plain HTML/CSS/JS). There is no build step — serve files over HTTP to enable the service worker, microphone, and other browser APIs.

- Python 3 (recommended, works everywhere):
  - macOS/Linux
    ```bash
    python3 -m http.server 8000
    ```
  - Then open:
    - Home: http://localhost:8000/index.html
    - Simple home (bigger fonts, inline logic): http://localhost:8000/index_simple.html
    - Any lesson directly (examples):
      - http://localhost:8000/ai.html
      - http://localhost:8000/phone.html

- Node (optional):
  ```bash
  npx serve -l 8000 .
  ```

Notes for local dev
- Avoid file:// URLs; service workers and getUserMedia (microphone) require https or http://localhost.
- If changes to sw.js or the STATIC_ASSETS list don’t appear, do a hard reload (Shift+Reload) or bump CACHE_NAME in sw.js.

## Common commands
- Start local server (Python): `python3 -m http.server 8000`
- Start local server (Node): `npx serve -l 8000 .`
- No build: open pages directly at localhost once server is running.
- Lint: not configured.
- Tests: not configured.

## High‑level architecture
The app is a multi‑page, beginner‑friendly PWA with shared accessibility, text‑to‑speech, and progress tracking.

- Entry points
  - `index.html` — main homepage (language switcher, search stub, big tile menu, voice modal).
  - `index_simple.html` — simplified homepage (extra‑large UI, inline script for tips/progress).
  - PWA bits: `manifest.json`, `sw.js` (see “Offline caching”).

- Internationalization (homepage only)
  - `app.js` exposes a TRANSLATIONS object (`fr`, `zh`, `en`) and `applyLang()` updates visible labels.
  - `script.js` is a thin loader that injects `app.js`.

- Shared features (loaded on many pages)
  - `tts.js` — Text‑to‑Speech helpers. Injects 🔊 buttons next to instruction‑like elements and renders a speed control (Slow/Normal/Fast). Public API: `window.AideTTS`.
  - `progress.js` — Local progress + badges persisted to `localStorage`. Public API: `window.AideProgress` (e.g., `renderHome`, `attachCompletionPanel`, `markSkillComplete`).
  - `voice.js` — “Ask for help” practice modal on the homepage; optional Web Speech (STT) if supported.
  - `features/` contains small wrapper scripts that dynamically load the root versions (e.g., `features/tts.js` injects `../tts.js`). On the homepage we include these wrappers.
  - `features/accessibility.js` — persists high‑contrast and font size and exposes `window.AideA11y`.

- Lesson pages (each with its own trio: HTML/CSS/JS)
  - Examples: `ai.html` + `ai.css` + `ai.js`, `phone.html` + `phone.css` + `phone.js`, `computer.html` + `computer.css` + `computer.js`, etc.
  - Each lesson usually includes `tts.js` and `progress.js`. Many show a “Finish this lesson” panel via `AideProgress.attachCompletionPanel({ skillId: ... })`.

- Module wrappers (friendly paths)
  - `modules/*.html` are tiny redirect pages (e.g., `modules/ai_tools.html` → `ai.html`). The homepage card routing in `app.js` points to these module URLs.

- Offline caching (service worker)
  - `sw.js` uses:
    - Network‑First for navigation/HTML requests (fresh content when online, cached fallback when offline).
    - Cache‑First for static assets (CSS/JS/icons). Update `STATIC_ASSETS` when adding new top‑level pages or assets you want cached.
    - Bump `CACHE_NAME` to force clients to pick up a new cache after significant asset changes.

## How to make common changes
- Add a new lesson page
  1) Create `mytopic.html`, `mytopic.css`, `mytopic.js` (follow patterns in existing lessons).
  2) If you want a modules/ entry, add a simple redirect page in `modules/` (copy any existing one and change its target).
  3) Homepage card routing: update the click mapping in `app.js` (the `els.cards.forEach(...)` handler) to navigate to your new module/page.
  4) Add translation labels in `app.js` under `TRANSLATIONS[lang].skills` so the homepage shows a localized card title.
  5) Update `sw.js` `STATIC_ASSETS` so the new files are available offline (HTML, CSS, JS, and any icons).

- Adjust TTS or progress behavior
  - For TTS speed presets or control text, edit `tts.js`.
  - For badges, default skills list, or quiz questions, edit `progress.js` (see `SKILLS`, `QUIZZES`, and `computeBadges`).

- Service worker/dev cache gotchas
  - During rapid iteration you may need to hard reload or unregister the SW (Browser DevTools → Application → Service Workers → Unregister). Bumping `CACHE_NAME` is the code‑level switch.

## Conventions
- No bundler or framework. Keep paths relative and include scripts directly with `<script src="..."></script>`.
- Browser features used: PWA (SW/manifest), Web Speech (TTS everywhere, STT where available), getUserMedia (microphone) for voice practice.
