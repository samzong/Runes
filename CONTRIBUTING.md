# Contributing

Runes welcomes new identities, platform outputs, and improvements to the generator or catalog.

Before opening a pull request:

1. Explain the project behavior the Rune represents.
2. Keep the character inside the 7×7 construction contract.
3. Write a concrete design rationale.
4. Verify the mark at 16, 32, 64, and 128 pixels.
5. Run `pnpm check`.

Do not edit files under `public/generated` by hand. Change the source data or generator and rebuild them.

Keep pull requests focused. A new platform should define exact dimensions, color behavior, mask ownership, and a deterministic filename before adding exports.
