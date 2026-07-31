# cookie-demo

A scroll-driven web "reel" that recreates a seven-second slice of the NewJeans
**"Cookie"** music video (**2:13 → 2:20**) as a single pinned page. Scroll is the
transport: a giant chocolate-chip cookie zooms in, bursts into scattering
cookies, the stage cuts to electric blue, and a marker-doodled CD resolves —
scrubbable forwards and back via the timecode bar at the bottom.

Everything on screen is drawn (Canvas 2D + CSS gradients); **no real footage is
used**. Korean + English copy, Y2K broadcast styling.

## Tech

- [Astro 7](https://astro.build/blog/astro-7/) — static output, single page
- Vanilla Canvas 2D + CSS for all animation (no runtime framework/JS deps)
- Self-hosted webfonts (no CDN at runtime) — see `public/fonts/`

## Develop

```bash
npm install
npx playwright install chromium
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the production build
```

## Design harness

This repository also acts as an executable reference for agent-driven design
work. [`design.md`](design.md) describes how to read and transform the design
without turning it into a fixed token sheet. [`SKILL.md`](SKILL.md) gives an
agent the working loop. The rendered reel and its source remain the primary
reference.

## UI checks

The design may evolve. Check changes against their current intent with the
project build and task-specific Shimon cases for the affected routes, scroll
states, and viewport widths, then inspect every returned screenshot.

## Deploy

Static site — Vercel auto-detects Astro and serves `dist/`. Import the repo in
Vercel (Framework preset: **Astro**, build `astro build`, output `dist`); no
adapter or extra config needed.

## Video edition

The interactive site and the rendered video live in this repository so they share the
same components, styles, Canvas renderer, and seven-second timeline. The Astro build emits
`/video/` as a HyperFrames composition; the video transport maps HyperFrames seek time back
to the existing `frame(p)` function.

```bash
npm run video:dev       # HyperFrames preview
npm run video:check     # build + deterministic seek checks
npm run video:render    # -> video/renders/cookie-reel.mp4
```

Keep generated MP4 files out of Git. Vercel remains responsible only for the static Web
edition. For a shareable video, run the **Render video release** GitHub Action manually to
download an artifact, or push a `video-v*` tag (for example `video-v1.0.0`) to create a
GitHub Release containing the MP4. Upload that file separately to social/video platforms;
do not make the Vercel build render video.

## Disclaimer

Personal, **non-official / non-commercial fan tribute** to NewJeans' "Cookie"
(© HYBE / ADOR). Not affiliated with or endorsed by the artist, label, or any
rights holder. All group names, song titles, and the "Cookie" MV are the
property of their respective owners. No original video frames are included in
this repository or the built site; every visual is redrawn. Made for personal
study only.

Fonts are redistributed under the SIL Open Font License — see
[`public/fonts/FONTS.md`](public/fonts/FONTS.md).
