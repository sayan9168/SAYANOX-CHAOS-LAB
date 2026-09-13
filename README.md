# SAYANOX CHAOS LAB

> **Change the rules. Watch the system break.**

An interactive, browser-first simulation laboratory for exploring chaos, emergence, and complex systems. Everything runs locally in the browser — no backend and no paid AI API.

## ✨ Features

- Real-time particle/agent simulation on Canvas
- Live controls for gravity, population, randomness, and speed
- Balanced, Storm, and Order experiment presets
- Pause/resume simulation
- Responsive desktop and mobile interface
- Lightweight React + TypeScript + Vite stack
- Automated typecheck, tests, and production build with GitHub Actions

## 🚀 Run locally

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

## Architecture

The application is intentionally client-side. The simulation loop uses the browser Canvas API and `requestAnimationFrame`; React owns controls and application state.

## License

Apache License 2.0. See `LICENSE`.

Built under the **SAYANOX** project family.
