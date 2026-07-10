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
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve the production build
```

## Verifying a refactor

Almost every change to the reel's two source files is meant to leave the picture
alone. `scripts/fingerprint.sh` proves it, so that stops being a matter of
opinion. It hashes what the reel *draws* — the canvas, the 47 baked crumbs, the
transforms, the doodle's `--w`, and the resolved backgrounds — rather than
comparing screenshots, whose bytes are not reproducible here (`mix-blend-mode`
and the `preserve-3d` lid are rasterised on the GPU).

```bash
npm run dev &                             # the tool reads a live page
scripts/fingerprint.sh selftest           # capture twice; the tool must agree with itself
scripts/fingerprint.sh capture before     # on main
#   ...make the change...
scripts/fingerprint.sh capture after
scripts/fingerprint.sh diff before after  # exit 0 = the picture is unchanged
```

Run `selftest` first. A comparison that cannot fail proves nothing, and this one
has been fooled three times: by an empty file, by GPU raster noise, and by a
synthetic mouse event that healed the very bug it was written to expose.

## Deploy

Static site — Vercel auto-detects Astro and serves `dist/`. Import the repo in
Vercel (Framework preset: **Astro**, build `astro build`, output `dist`); no
adapter or extra config needed.

## Disclaimer

Personal, **non-official / non-commercial fan tribute** to NewJeans' "Cookie"
(© HYBE / ADOR). Not affiliated with or endorsed by the artist, label, or any
rights holder. All group names, song titles, and the "Cookie" MV are the
property of their respective owners. No original video frames are included in
this repository or the built site; every visual is redrawn. Made for personal
study only.

Fonts are redistributed under the SIL Open Font License — see
[`public/fonts/FONTS.md`](public/fonts/FONTS.md).
