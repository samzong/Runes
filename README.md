# Runes

![Runes](public/og.svg)

Runes is an open-source personal identity system for software projects. A single 7×7 orthogonal character becomes a complete, deterministic asset family for social profiles, desktop apps, menu bars, Windows, the web, and presentations.

The repository currently contains one system identity and 41 project identities. Every Rune has its own source geometry, accent role, tagline, project link, and design rationale.

## What it generates

Each identity produces:

- Canonical mono, inverse, duotone, horizontal, stacked, and field-backed SVG logos
- 1024 social avatar, 1200×630 Open Graph image, and 1500×500 X header
- Apple 1024 app source, Dock PNG, menu bar template assets, iconset, and cross-platform generated ICNS
- Windows ICO containing 16, 24, 32, 48, and 256 pixel images
- Web SVG, transparent mark, favicon PNGs, Apple touch icon, and PWA icons
- 1920×1080 presentation title slide
- Per-identity manifest and repository-wide SHA-256 checksums

The public catalog keeps the lightweight SVG set in Git. Full platform packs are generated locally and published through the website download center.

## Run locally

```bash
pnpm install
pnpm assets:build
pnpm dev
```

Open `http://localhost:5173`.

Run the complete gate:

```bash
pnpm check
```

## Publish with Blueprint

Runes builds as a standard static Vite site. Blueprint is only the publishing adapter; the generated `dist/` directory remains portable to any static host.

```bash
blueprint --version
pnpm deploy
```

`pnpm deploy` builds the site and publishes `dist/` under the deployment name `runes`. The adapter creates and removes an ephemeral Blueprint Artifact so this repository does not carry Blueprint project metadata.

## Repository map

```text
brand/runes.json      Identity geometry, metadata, color role, and rationale
brand/tokens.json     Canonical color, geometry, and typography tokens
brand/theme.css       Reusable website theme contract
scripts/generate.mjs  Deterministic SVG and platform-asset generator
scripts/check.mjs     Geometry, export, raster, and checksum verification
public/generated/     Reviewable SVG catalog used by the website
artifacts/            Reproducible full export packs, intentionally ignored
docs/                 Brand and platform rules
```

## Add a Rune

Use the repository skill [`$add-rune`](.agents/skills/add-rune/SKILL.md). It turns the process into a deliberate production loop:

1. Inspect the project and reduce it to its action, object, transformation, and anti-metaphor.
2. Render three 7×7 candidates across small, mono, duotone, field, and menu-bar states.
3. Let the owner choose the geometry and review the public tagline and rationale.
4. Add only the selected identity to `brand/runes.json`.
5. Generate and verify every platform asset and download pack with `pnpm check`.

Canonical data is not changed before visual selection. Generated SVG, PNG, ICO, ICNS, ZIP, manifest, and checksum files are never edited by hand.

The generator rejects malformed grids, duplicate characters, unknown accent roles, out-of-shape signal cells, missing exports, font-dependent SVG text, incorrect raster dimensions, and checksum drift.

The catalog includes public, non-fork repositories with independent product or tool semantics. Profile repositories, package distribution taps, learning samples, and explicitly legacy integrations stay outside the identity count.

## Apply a Rune to a project

Install or link the repository skill [`$apply-rune-brand`](.agents/skills/apply-rune-brand/SKILL.md) into the agent host, then invoke it from the consumer project. It audits the surfaces that project actually ships, maps each one to a canonical generated asset, integrates the smallest useful asset set, and requires visual plus repository-level verification.

Creation and application stay separate: `$add-rune` owns canonical identity decisions in Runes, while `$apply-rune-brand` owns downstream placement without redrawing or forking the logo. A CLI or SDK repository may need only a README lockup and GitHub social image; a desktop app or website uses its platform-specific pack and theme contract.

Read [Brand system](docs/BRAND.md), [Platform contracts](docs/PLATFORMS.md), and [Contributing](CONTRIBUTING.md) before proposing a new identity or output format.

## License

[MIT](LICENSE)
