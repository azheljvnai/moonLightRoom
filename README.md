# Moon Light Room

ENHYPEN-inspired photo booth app — live camera, photo capture with overlay, reaction video, and Valentine question overlay.

## Setup

```bash
npm install
npm run dev
```

## Project structure

- **public/frames/** — Add `red-moon-frame.png` (ENHYPEN-inspired photo overlay).
- **public/bg/** — Add `dark-gradient.jpg` for optional background image; then add class `has-bg-image` to the app root in `App.jsx`.
- **public/audio/** — Add `background.mp3` for optional soft instrumental background music (toggle appears bottom-right).
- **src/components/** — `CameraPreview`, `PhotoCapture`, `VideoRecorder`, `ValentineOverlay`, `BackgroundAudio`.

## Stack

- Vite + React
- TailwindCSS
