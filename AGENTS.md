# AGENTS instructions for this repository

## Project overview
- This repository contains a static single-page app for an Instagram-style layout studio.
- The main files are [index.html](index.html), [styles.css](styles.css), and [script.js](script.js).
- There is no build step or package manager workflow here; verify changes by opening [index.html](index.html) in a browser and checking the affected UI.

## Dark mode and theme conventions
- The interface is designed around a dark theme by default. Preserve the existing dark palette and `color-scheme: dark` behavior in [styles.css](styles.css).
- Prefer updating the shared CSS variables defined in `:root` for colors, surfaces, text, borders, and accents instead of hard-coding new colors in individual rules.
- Keep contrast high for text, controls, and borders. Avoid introducing light text on light backgrounds or low-contrast UI states.
- When adding new UI surfaces, follow the existing visual language: translucent dark panels, subtle borders, and soft shadows.

## Editing guidance
- Keep the structure in [index.html](index.html) and the behavior in [script.js](script.js) aligned with each other.
- Prefer styling changes in [styles.css](styles.css) and reuse existing component patterns such as `.panel`, `.hero-card`, `.preset-btn`, and `.selection-toolbar`.
- Avoid adding frameworks or build tooling unless explicitly requested.
