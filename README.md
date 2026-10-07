# Hardik — macOS Portfolio 2.0

A proper React/Vite rebuild of the interactive macOS-inspired portfolio. The UI uses a single reactive state model instead of the previous DOM-heavy script.

## Stack

- React 19.3
- Vite 8.3
- Tailwind CSS 4.3 via `@tailwindcss/vite`
- Motion for React 13.5 (`motion/react`)
- Lucide React 1.52 for tree-shakeable SVG icons

These choices follow the current official setup guidance for React/Vite/Tailwind and Motion. React 19.3 is current on the React blog as of September 2026; Tailwind 4.3 is current in the Tailwind release feed; Vite 8.3.3 and Lucide React 1.52.0 are current package releases seen during the build.

## Run

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (the config defaults to port `4173`).

## Production build

```bash
npm run build
npm run preview
```

## What is interactive

- Desktop widgets can be enabled/disabled, resized and reordered with drag gestures.
- Weather and GitHub cards can use live public API data.
- Notes persist to `localStorage`.
- Theme, accent, wallpaper, glass intensity, dock, menu bar, widget and privacy settings persist to `localStorage`.
- Finder-style workspace navigation is built into the portfolio shell.
- Windows can be dragged, focused, maximized, minimized and closed.
- Spotlight opens with `Cmd/Ctrl + K`.
- `Cmd/Ctrl + 1` Finder, `2` Notes, `3` Projects, `,` Settings.
- Control Center has working Wi-Fi/Bluetooth/Focus state, brightness and volume controls.

## Personalize

Edit the `PROFILE` object at the top of `src/main.jsx` for your name, bio, skills, links and project case studies.

## Notes

The icon system uses Lucide React SVG components with custom Liquid Glass gradients and layers rather than redistributing Apple's proprietary SF Symbols artwork.
