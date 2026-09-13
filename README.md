# SAYANOX CHAOS LAB

> **Change the rules. Watch the system break.**

An interactive, browser-first simulation laboratory for exploring chaos, emergence, and complex systems. Everything runs locally in the browser — no backend and no paid AI API.

## Features

- Real-time particle/agent simulation on Canvas
- Live controls for gravity, population, randomness, and speed
- Balanced, Storm, and Order experiment presets
- Pause/resume simulation
- Responsive desktop and mobile interface
- Deterministic, unit-tested simulation utilities
- Production typecheck, tests, and build checks
- GitHub Actions CI
- GitHub Pages deployment workflow
- No backend, database, secret, or paid AI API required

## Requirements

- Node.js 22+
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Quality checks

```bash
npm run check
npm test
npm run build
```

## Deployment

The repository includes `.github/workflows/deploy.yml` for GitHub Pages. Enable GitHub Pages with **GitHub Actions** as the deployment source in the repository settings before the first deployment.

## Architecture

The application is intentionally client-side. React owns UI state and controls, while the browser Canvas API and `requestAnimationFrame` run the visual simulation. Pure simulation helpers live in `src/simulation.ts` so they can be tested without a browser.

## License

Apache License 2.0. See `LICENSE`.

Built under the **SAYANOX** project family.
