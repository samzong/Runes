---
name: add-rune
description: Add or revise one project identity in the Runes repository, from project discovery and 7x7 Tool Rune exploration through deterministic platform assets, download packs, and visual review. Use when a project needs a new Runes logo or an existing Rune needs deliberate redesign.
---

# Add a Rune

Create one durable member of the Runes family without bypassing visual approval or editing generated assets by hand.

## Establish the brief

Read `brand/runes.json`, `brand/tokens.json`, `docs/BRAND.md`, `docs/PLATFORMS.md`, and the current project source before designing.

Confirm that the project has independent product or tool semantics. Profile repositories, forks, package taps, learning samples, and legacy integrations do not receive their own Rune without an explicit owner decision.

Reduce the project to five facts:

- the action it performs;
- the object or boundary it acts on;
- the transformation that makes it distinctive;
- one literal category symbol to avoid;
- its canonical source URL and family category.

Do not finalize the tagline, rationale, or public product meaning on the owner's behalf.

## Explore before canonical data

Create a three-candidate comparison under `.local/rune-candidates/<slug>/`. Keep the candidates on the same verified brief and render each at 16, 32, 64, and 128 pixels in mono, duotone, field, and menu-bar contexts.

Each candidate must:

- use the 64-pixel canvas, 7x7 grid, 8-pixel unit, and 4-pixel padding;
- use only orthogonal filled cells with no curves, text, or font dependency;
- remain recognizable in one color before accent cells are applied;
- avoid cloning another Rune's grid or using a literal app-category glyph;
- place every signal coordinate on a filled cell;
- explain how its geometry expresses the project action.

Inspect the rendered comparison with `browser-cdp`. The owner chooses the geometry and reviews the tagline and rationale. Do not write a candidate into `brand/runes.json` before that choice.

## Add the selected identity

Add exactly one object to `brand/runes.json` with:

- a stable lowercase hyphenated `slug`;
- the public project `name`;
- one existing `category`;
- the canonical `source` URL;
- an owner-reviewed `tagline` and `rationale`;
- seven binary `grid` rows;
- an existing token-backed `accent`;
- valid `signal` coordinates.

The rationale must describe both the visible construction and why it belongs to the project. Generated SVG, PNG, ICO, ICNS, ZIP, manifest, and checksum files are outputs; never edit them directly.

## Generate and prove the result

Run:

```bash
pnpm assets:build
pnpm assets:check
pnpm check
```

Verify the selected Rune in the website at the small-size specimen, social avatar, app icon, menu bar, browser, presentation, and download-center states. Confirm that its complete ZIP contains both `apple/app-icon.icns` and `windows/icon.ico`, and that every platform ZIP downloads successfully.

Report the selected concept, generated asset counts, verification evidence, and any platform state that was not rendered. Do not commit, push, deploy, publish, or change another Rune without explicit authorization.

After the identity is approved and generated, use `$apply-rune-brand` from the consumer project to select and integrate only the assets its real product surfaces need.

For an existing Rune redesign, treat the grid as identity-breaking. Preserve its slug and source, show the old and proposed marks side by side, and require explicit owner approval before replacing canonical geometry.
