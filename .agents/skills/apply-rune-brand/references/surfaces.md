# Surface selection

Choose assets by the surface the product actually ships. The complete pack is a source bundle, not a requirement to vendor every file.

| Product surface | Canonical source | Application rule |
| --- | --- | --- |
| README or documentation header | `logo/horizontal.svg`, `logo/badge.svg`, or `social/open-graph-1200x630.png` | Use the horizontal lockup only on a controlled Paper or white field; use a field-backed asset when the renderer switches between light and dark themes. Do not replace useful status or package badges. |
| Compact documentation mark | `logo/mark-duotone.svg` | Use only where at least 32 pixels and a controlled light field are available. |
| Monochrome UI or print | `logo/mark.svg` or `logo/mark-inverse.svg` | Select by field contrast; a CSS mask is acceptable only for a functional monochrome icon. |
| GitHub or X avatar | `social/avatar-1024.png` | Upload the generated circle-safe composition without adding another mask. |
| GitHub social preview or page Open Graph | `social/open-graph-1200x630.png` | Treat repository settings as a separate external write. |
| X profile header | `social/x-header-1500x500.png` | Do not add account-specific copy to the permanent asset. |
| Website identity | `logo/horizontal.svg`, `logo/mark-inverse.svg` | Use the lockup in brand navigation and the mark in compact navigation. |
| Browser icons | `web/favicon.svg`, `web/favicon-16.png`, `web/favicon-32.png` | Keep SVG plus exact raster fallbacks where the stack supports them. |
| Touch and installed web app | `web/apple-touch-icon-180.png`, `web/pwa-192.png`, `web/pwa-512.png` | Reference exact sizes in the web manifest and document head. |
| macOS application | `apple/app-icon.icns`, `apple/app-icon-1024.png` | Use the unmodified app source; let the operating system apply its mask. |
| macOS menu bar | `apple/menubar/*Template.png`, `*Template@2x.png` | Mark the native image as a template so AppKit controls appearance. |
| Windows application | `windows/icon.ico` | Use the multi-size ICO rather than resampling one PNG. |
| Presentation | `presentation/title-slide-1920x1080.png`, `logo/horizontal.svg` | Use the title artwork as the opening field and vector lockups elsewhere. |

## Product theme

Apply the Runes theme only when the target has a branded visual frontend or artifact. Preserve its established interaction system and map Runes into the existing token owner.

- Ink and Paper own structure and neutral surfaces.
- The identity accent owns major brand fields, not ordinary body text.
- Signal color marks selected, active, or diagnostic detail.
- Hard borders and grid alignment replace decorative depth on brand surfaces.
- Native controls may keep modest rounding; the Rune and brand panels remain square.
- Product state colors remain separate from brand colors.

For an identity whose `accent` is `blue`, the effective pair is Blue field plus Acid signal. If `accent` is `acid`, use Acid field plus Blue signal. Orange and Violet fields also use Acid signal.

## Kitup-like CLI or SDK repository

For a repository like Kitup, first inspect whether it ships a website or native application. When it consists of source packages, README documentation, and GitHub metadata, the default mapping is intentionally small:

| Surface | Asset | Expected treatment |
| --- | --- | --- |
| README identity | `logo/horizontal.svg` on a controlled light field, otherwise `logo/badge.svg` or `social/open-graph-1200x630.png` | Place above the project title while retaining registry badges and verify both GitHub themes. |
| Documentation accent | `logo/mark-duotone.svg` | Use sparingly for an overview or architecture cover, not on every page. |
| GitHub social preview | `social/open-graph-1200x630.png` | Prepare and visually verify locally; upload only with explicit authorization. |

Do not add Apple, Windows, favicon, or PWA assets until the repository actually owns those surfaces. Do not rewrite technical documentation merely to imitate Runes website copy.
