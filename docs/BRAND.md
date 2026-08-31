# Brand system

## The idea

Runes is an authored alphabet for tools. Every project receives a distinct character, but every character visibly belongs to the same maker.

The system is infrastructure, not a gallery of unrelated marks. Geometry is the source of truth; color, masks, lockups, and export sizes are applications of that source.

## Construction

Every canonical Rune uses the same contract:

- 64×64 view box
- 7×7 binary grid
- 8-unit modules
- 4-unit outer padding
- Orthogonal edges only
- No curves, gradients, shadows, or optical effects in the canonical mark
- One canonical color; at most one signal color in application variants

Each character must remain recognizable at 16 pixels. If a concept only works through fine detail, it does not belong in this alphabet.

## Identity hierarchy

1. The Rune is the invariant identity.
2. The mono mark is the canonical master.
3. The signal color identifies an active cell, path, or junction.
4. The field color identifies context or product surface.
5. Platform masks and effects belong to the operating system, never to the master geometry.

This hierarchy lets menu bar icons stay black and transparent while social avatars, app icons, and slides can carry strong color without becoming different logos.

## Color roles

| Token | Value | Role |
| --- | --- | --- |
| Ink | `#0A0A09` | Canonical mark, text, structural line |
| Paper | `#F2F0E9` | Neutral field and documentation surface |
| Field Blue | `#225CFF` | Default product field and system identity |
| Signal Acid | `#D8FF38` | Active cell, state, or junction |
| Signal Orange | `#FF5A36` | Warm high-energy project family |
| Electric Violet | `#7B61FF` | Experimental or model-oriented family |

Color is never the only carrier of identity. Every Rune must pass in one color before receiving an accent.

## Typography

Wordmarks use Ubuntu Mono 700 converted to SVG paths during generation. The output has no runtime font dependency and stays stable across platforms.

Interfaces use the same monospaced voice for labels, measurements, metadata, and controls. Large display copy is compact, blunt, and technical. Decorative pseudo-terminal copy, fake code, and ornamental gradients are outside the system.

## Composition

- Use hard borders, visible grids, and explicit alignment.
- Prefer high-contrast fields to decorative depth.
- Keep the Rune centered inside social and app safe areas.
- Use horizontal lockups when the project name must be read.
- Use stacked lockups only where height is available.
- Never distort, rotate, round, or outline the canonical Rune.
- Never pre-apply an operating-system icon mask.

## Naming and rationale

Each identity includes a short tagline and a design rationale. The rationale must explain the relationship between the project and the geometry without relying on a hidden initial, mascot, or generic software metaphor.

The catalog is the review surface for those decisions. A new Rune is incomplete until its geometry, rationale, and small-size behavior survive together.

## Website theme

`brand/theme.css` is the portable theme contract. A Runes-compatible site should use:

- Ink and paper as the structural base
- A single field color per major section
- Signal color only for selected, active, or diagnostic states
- Square product surfaces and modest rounding only for native controls
- Monospaced metadata and measurement labels
- Borders and grid rhythm instead of floating cards and soft shadows

The website may evolve independently, but the tokens and hierarchy above remain the shared family contract.
