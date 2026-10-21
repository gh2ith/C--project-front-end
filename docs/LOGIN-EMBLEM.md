# Login emblem illustration — October 21, 2026

The owner supplied the pointed university emblem as the replacement reference for the speculative Roman arch. This revision changes only the login artwork; homepage changes are a separate next step. The existing supplied header logo remains untouched.

`assets/yarmouk-emblem-assembly.svg` is a code-native drawing, not the generated PNG. It follows the reference's pointed shoulders/flared frame, black interior motif, intersecting red orbital loops and green wheat. Ivory edges and a restrained gold line suit the login's existing emerald illustration panel. This is an owner-requested web interpretation, not a claimed newly approved institutional logo or historical monument.

The latest correction attaches the Arabic and English university names to a trapezoid base as part of the SVG. Its green is **#08744C**, darker than the reference's bright green; names remain white. Modern readable Arabic and English fonts replace the old irregular lettering. The base appears only after the interior emblem finishes: frame draw 0–1.05s, motif .7–1.25s, orbits .96–1.51s, wheat 1.18–1.68s, attached nameplate 1.75–2.2s. There is no continuous rotation, pointer tilt or flashing. Reduced motion shows the completed emblem immediately.

The built-in image generator produced a standalone study before coding, using the supplied image as the shape/color authority. The subsequent owner correction superseded its detached name treatment; the runtime now has a joined base. No generated bitmap is used by the page.

Verification: `node tools/verify-login-emblem.cjs` passes at 1440×900,1366×768,1280×720,1280×650,1024×768 and390×844. Checks cover image bounds and form visibility, no horizontal/document overflow on laptops, ordered SVG/name animation, reduced motion, all four existing local role routes, password visibility, no password persisted by the test and no browser errors. This work does not add backend authentication.

Screenshot: [laptop](../output/playwright/login-emblem-nameplate.png). Per-size screenshots and reduced-motion view are under ignored `output/playwright/login-emblem/`.

## Password-driven Golden Jubilee morph

The latest owner supplied the gold jubilee artwork and explicitly requested a character-by-character geometric transformation, rather than exchanging or crossfading two images. `pages/login/emblem-morph.js` upgrades the original SVG image to one inline SVG with persistent paths; if loading or JavaScript is unavailable the original accessible image remains.

Closed contours are sampled to160 equidistant points, with cyclic starting-point/direction alignment minimizing twisted motion. Their coordinates are interpolated in place: black motif→5, original red orbital contours→Y and the lower0, original wheat→curved wheat crown. The frame stays attached while its material changes to gold outlines and emerald. Gold gradient stops interpolate from each original color; the nameplate stays attached and changes material. Only the small supporting jubilee words/dates reveal by opacity. The main emblem is never crossfaded with a replacement image. This is a clean SVG interpretation of the supplied jubilee reference, without its photograph-like texture or surrounding poster decorations.

Each of the first ten input characters advances the shared timeline by one tenth. The5 resolves first, then theY/0 and wheat. Additional characters hold the final state. Backspace/delete reverses along the same geometry; clearing restores the original. Animation retargets from its current position with an85ms response constant and stops once settled. Blur and show/hide hold progress. Paste and IME composition are supported. Only transient input length drives the artwork; password contents are not stored, logged, transmitted or used to infer strength/validity by this controller. This does not change the existing local role/account flow. Reduced motion applies each geometry state immediately with no continuous animation.

`node tools/verify-login-morph.cjs` passes ten incremental states, persistent DOM path identity, no main-path opacity swap, exact reverse deletion, rapid interrupted edits/paste, stable holds, password visibility/blur, reduced-motion mobile and no-JavaScript fallback. The existing six-size/four-role check also passes. [Typing preview](../output/playwright/login-morph/typing-morph.webm), [middle state](../output/playwright/login-morph/step-5.png), [jubilee](../output/playwright/login-morph/step-10.png). Files remain local for review.
