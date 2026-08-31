# Platform contracts

All files below are generated from `brand/runes.json` by `scripts/generate.mjs`.

## Social

| Surface | Output | Treatment |
| --- | --- | --- |
| GitHub and X avatar | 1024×1024 PNG and SVG | Field-backed, centered, circle-safe |
| Open Graph | 1200×630 PNG and SVG | Rune plus outlined project wordmark |
| X header | 1500×500 PNG and SVG | Wide field composition |

The master geometry stays inside a 62.5% safe area so circular avatars do not clip the character.

## Apple apps and Dock

The primary app source is a square, unmasked 1024×1024 SVG and PNG. Rounded corners are previewed on the catalog website but are not baked into the deliverable. Apple applies the platform mask.

The generator also creates a complete iconset and packages it as `app-icon.icns` with the cross-platform JavaScript encoder used by the asset pipeline.

Reference: [Apple Human Interface Guidelines — App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) and [Creating your app icon using Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer).

## macOS menu bar

Menu bar assets are black plus alpha only:

- 16×16 template PNG
- 32×32 `@2x` template PNG
- Transparent SVG source

This lets AppKit apply the correct appearance for light, dark, selected, and disabled states.

Reference: [NSImage.isTemplate](https://developer.apple.com/documentation/appkit/nsimage/istemplate).

## Windows

The ICO contains dedicated 16, 24, 32, 48, and 256 pixel images instead of relying on one large bitmap to be resampled by the shell.

Reference: [Microsoft — App icon construction](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-construction).

## Web and browser

Each project receives:

- Field-backed SVG favicon
- Transparent canonical SVG mark
- 16×16 and 32×32 favicon PNGs
- 180×180 Apple touch icon
- 192×192 and 512×512 PWA icons

Use the transparent mark for monochrome browser or documentation contexts and the field-backed icon where color improves project recognition.

## Presentation and documents

The generated 1920×1080 title slide provides a stable opening composition. Vector horizontal and stacked lockups can be placed into decks and documents without raster scaling.

Presentation exports intentionally contain no speaker name, event, date, or editable body copy. Those belong to the deck, not to the permanent identity asset.

## Determinism

Exports do not contain timestamps. Wordmarks are converted to outlines. `artifacts/SHA256SUMS` covers every generated file except itself, and `pnpm assets:check` recomputes the hashes.

All outputs, including ICNS, are generated cross-platform. CI is configured to verify the complete contract on Ubuntu and publish a complete downloadable artifact pack from its asset job.
