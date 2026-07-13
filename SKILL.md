---
name: cookie-design-harness
description: Use cookie-demo as an executable design reference and verify visual invariants with Shimon.
---

# Cookie design harness

Use this skill when exploring, adapting, or refactoring the design language demonstrated by this repository.

## Read the reference

1. Read `design.md` for the transferable design qualities and the allowed interpretation range.
2. Run the reel and inspect the complete scroll sequence in both directions.
3. Read the relevant components, styles, and scripts before extracting a pattern.
4. Treat the rendered code as the primary reference when prose cannot describe a relationship precisely.

Do not reduce the reference to a Y2K palette, cookie motif, or collection of tokens.
State which relationship you are transferring, such as rhythmic staging, one-object hierarchy, structured typography interrupted by hand-made marks, or material-led motion.

## Choose the kind of change

- For a refactor, the selected visual invariants should remain equal.
- For an intentional redesign, fingerprint changes are expected but every changed path must be explained.
- For an exploration, produce a coherent proposal before deciding which differences should become new reference material.

An unexpected interpretation is valid when its hierarchy, rhythm, and material behavior remain coherent.
Preserve it as a candidate rather than silently normalizing it back to the current reel.

## Verify with Shimon

Install the browser once after installing dependencies in a clean environment:

```sh
npm install
npx playwright install chromium
```

Start the site on the URL declared in `shimon.config.mjs`:

```sh
npm run dev -- --port 4322
```

In another shell, verify that the harness is deterministic before relying on a comparison:

```sh
npx shimon selftest --json
npx shimon capture baseline --json
```

After the change:

```sh
npx shimon capture current --json
npx shimon diff baseline current --json
```

Exit code `1` means the recorded UI differs; it is not an operational error.
Inspect every changed JSON path and compare the corresponding scroll state in the browser.
Do not delete or weaken a probe to make a refactor pass.
Update an invariant only after deciding that the visual change is intentional.

Shimon does not evaluate composition or taste.
Complete the review against `design.md` and the rendered sequence even when the fingerprint passes.

Do not add credentials, personal data, tokens, or authenticated content to a probe because artifacts and JSON output can persist in logs.
Treat `shimon.config.mjs` as trusted executable code and do not run it from an untrusted checkout.
