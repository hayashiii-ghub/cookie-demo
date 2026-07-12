# Bundled fonts

All fonts here are self-hosted (no CDN at runtime) and redistributed under the
**SIL Open Font License 1.1** (<https://openfontlicense.org>). Each remains the
property of its author; see the linked project for the full license text and
copyright notice.

| Files | Family | Source | License |
|---|---|---|---|
| `Pretendard-{Regular,Bold}.woff2` | Pretendard | <https://github.com/orioncactus/pretendard> (npm `pretendard@1.3.9`) | OFL 1.1 |
| `ibm-plex-mono-latin-{400,700}.woff2`, `ibm-plex-mono-latin-700-italic.woff2` | IBM Plex Mono | Google Fonts / Fontsource | OFL 1.1 |
| `nanum-pen-script-{korean,latin}-400.woff2` | Nanum Pen Script | Google Fonts / Fontsource | OFL 1.1 |
| `permanent-marker-latin-400.woff2` | Permanent Marker | Google Fonts / Fontsource | OFL 1.1 |
| `black-han-sans-{korean,latin}-400.woff2` | Black Han Sans | Google Fonts / Fontsource | OFL 1.1 |

The `.woff2` files were fetched once from jsDelivr / npm and committed so the
site has no external font dependency.

IBM Plex Mono replaced Space Mono for HUD / timecode readouts (harder industrial
figures, less rounded “portfolio tech” mono).

## The Pretendard and Korean files are subsets (2026-07-12)

Three families shipped full CJK coverage for a page that uses ~50 hangul
syllables. They are now subset to the glyphs the page actually uses:

| File | Full | Subset | Kept |
|---|---|---|---|
| `Pretendard-Regular.woff2` | 766 KB | 24 KB | ASCII + page hangul + page symbols |
| `Pretendard-Bold.woff2` | 791 KB | 24 KB | same |
| `nanum-pen-script-korean-400.woff2` | 601 KB | 13 KB | page hangul |
| `black-han-sans-korean-400.woff2` | 190 KB | 7 KB | page hangul |

Pretendard is not decorative but it is load-bearing in two quiet ways: the
booklet lede (`.lede`, the only visible `--sans` text) renders in it, and
symbols the latin mono/display subsets lack (→ · ▶ …) fall back to it. That is
why it stays in `--sans` / `--display` but only as a 24 KB subset.

**If you add new copy anywhere in `src/`** with hangul or an unusual symbol,
re-subset from the full fonts, or the new glyphs will silently fall back to a
system font (the `@font-face` `unicode-range` still claims the whole hangul
block, so nothing errors — it just renders in the wrong hand).

Regenerate (full originals: git history before 2026-07-12, or the sources above):

```sh
python3 -m pip install fonttools brotli
U=$(python3 -c "
import re
t=open('src/pages/index.astro',encoding='utf-8').read()+open('src/styles/reel.css',encoding='utf-8').read()
han=sorted(set(re.findall(r'[가-힣]',t)))
sym=sorted(set(c for c in t if ord(c)>126 and not ('가'<=c<='힣')))
print(','.join(['U+0020-007E']+['U+%04X'%ord(c) for c in sym+han]))")
# korean handwriting/display files: hangul part of $U only; Pretendard: all of $U
pyftsubset FULL-FONT.woff2 --unicodes="$U" --flavor=woff2 --layout-features='*' \
  --output-file=public/fonts/<name>.woff2
```

Kept-glyph coverage and metrics were verified identical to the originals
(cmap + hmtx + hhea/OS/2) at subset time, and the rendered page was verified
pixel-identical (within run-to-run noise) at 8 timeline points before/after.
Current hangul coverage (51 syllables):
가감고그기까나뉴닫동드랑래러로롤룩리릭릴받버생서스시아암에영온은이일임재전정져지진초컷케코쿠크클키타파
