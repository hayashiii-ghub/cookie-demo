# Design field guide

This repository is an executable design reference, not a template to reproduce.
Read the rendered reel and its source before translating its ideas into another interface.
The code contains more design information than this document can name.

## How to read the reference

Use the evidence in this order:

1. The rendered reel shows how the parts behave together.
2. The source shows how rhythm, layering, type, material, and motion are constructed.
3. This document identifies qualities worth carrying into a different context.
4. `shimon.config.mjs` records selected invariants; it does not define whether a design is good.

Do not copy the cookie, CD case, palette, or Y2K styling by default.
Transfer the decisions behind them.

## Qualities to carry forward

### Rhythm comes from distinct beats

The reel moves through readable states: approach, impact, release, reveal, and return.
Transitions have a reason and a destination.
Prefer a few strong beats over continuous ambient motion.

### One object establishes the hierarchy

Each state has a dominant object or gesture.
Metadata, marks, and texture support that focal point instead of competing with it.
Negative space is part of the composition.

### Precision and interruption coexist

Broadcast typography, timecode, and the fixed frame create a measured structure.
Marker lines, crumbs, grain, and abrupt cuts interrupt it.
The result should feel directed but not sterilized.

### Material should explain behavior

Plastic bends light, ink sits on a surface, crumbs scatter, and a hinged lid rotates as an object.
Texture is useful when it makes an element feel physical or explains its motion.
Avoid decorative noise that has no relationship to the object.

### Motion is transport

Scrolling moves through a composition rather than adding effects to a finished layout.
The sequence remains understandable in either direction.
When adapting this principle, tie motion to navigation, state, or cause and effect.

## Room for interpretation

An agent may change the medium, motif, palette, type, density, and spatial system.
It may also produce an unexpected reading that the source did not anticipate.
Keep that divergence when it has a coherent hierarchy, rhythm, and material logic.
Treat it as a candidate, not as an error or an automatic improvement.

Literal similarity is weak evidence of fidelity.
A visually different result can belong to the same design lineage when the relationships above remain legible.

## Signs that the translation has flattened

- The result could be any polished product landing page after replacing the copy.
- Every region has equal emphasis or equal amounts of decoration.
- Motion is ornamental and can be removed without changing the reading order.
- Grain, glow, gradients, glass, or retro UI are used as a theme without material logic.
- The source's motifs are copied while its rhythm and hierarchy disappear.

## Evaluating a proposal

Review the proposal as a whole before comparing individual tokens.
Ask whether the focal point is immediate, the beats are distinct, interruptions feel intentional, and motion explains a transition.
Then inspect implementation details and Shimon diffs.

A passing fingerprint only shows that the observations selected by this repository are unchanged.
An intentional redesign may change them.
Inspect every changed path, decide whether the new behavior is part of the proposal, and record that decision instead of weakening the probe to obtain a pass.

