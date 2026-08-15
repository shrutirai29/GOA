# HH Goa 2026 — Build Your Identity

A premium, 3D, fully client-side **identity card / PFP generator** for HH Goa 2026.
Upload a photo, customize your builder identity, and download a crisp 1080px PNG to
share on X with `#FrameInGoa`.

Built as a creative-tech festival microsite: deep-night palette, electric violet
identity, a real-time WebGL background (distorted chrome orb + sparkle particles),
character-level text reveals, magnetic buttons, a custom cursor, and a cinematic
"GENERATE MY ID" transition.

## Flow

1. **Drop your photo** — drag & drop or tap. JPG / PNG / WebP / HEIC all handled
   in the browser (HEIC decoded with `heic2any`). Photos are normalized,
   orientation-corrected and downscaled locally — **nothing is ever uploaded**.
2. **Customize** — name, stack/role, auto-generated builder title (regenerate any
   time), optional X handle + superpower. Drag the photo on the card to reposition,
   zoom, rotate.
3. **Pick a format & style** — BUILDER ID (1080×1350) or PFP FRAME (1080×1080),
   in three coherent styles: NIGHT · SUNSET · CHROME.
4. **Generate** — a ~1s cinematic scan transition, then download the high-res PNG
   (html-to-image at 2×, WYSIWYG with the live preview) or open X compose with a
   pre-filled caption.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **React Three Fiber / drei / three** — lazy-loaded background scene with
  mobile-specific simplification and `prefers-reduced-motion` support
- **Framer Motion** — reveals, tilt, magnetic buttons, cinematic states
- **html-to-image** — high-res PNG export from the live card DOM
- **heic2any** — in-browser HEIC → JPEG
- **lucide-react** — icons
- **next/og** — build-time-generated Open Graph image (`/og`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (generates /og statically)
npm start
```

## Deploying to Vercel

```bash
npm i -g vercel
vercel            # link to your project
vercel --prod     # production deploy
```

No environment variables are required. The OG image is generated at build time, so
deploys get a working social preview automatically. Update `SITE_URL` in
`src/app/layout.tsx` to your production URL before deploying.

## Project structure

```
src/
  app/            layout, metadata, page, OG image route
  components/
    three/        R3F scene (orb, particles, parallax rig)
    generator/    UploadZone, CropControls, BuilderForm, StyleSelector,
                  CardPreview (3D tilt), CardRenderer (preview + export), ExportBar
    ui/           Cursor, SplitText, BlurText, Magnet, ClickSpark, MagneticButton…
  lib/            cardStyles (themes/formats), titleGenerator, imageProcessor,
                  photoTransform (crop math), exportCard, share
```

## Privacy

All image processing is client-side. Photos are decoded, downscaled and stored as
in-memory data URLs only — never sent to a server, never persisted.
