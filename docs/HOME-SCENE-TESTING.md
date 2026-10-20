# Homepage scene acceptance — October 21, 2026

Desktop uses the reversible WebGL scene; mobile/tablet (900px and below), reduced motion and unavailable WebGL deliberately use the existing static gate/river introduction and five native-flow chapters. Mobile does not run the desktop camera or drag interaction. All original chapter messages, transcripts and actions remain intact.

## What changed

- Replaced the former field with a continuous distance-based terrain mesh. All river chapters now use the same broad rounded grassy terraces, with feathered edges fading to white. A distance-based surface prevents folded strips at river bends.
- Shortened the river to **51.55 scene units along its centerline**, with a **48-unit longitudinal extent** (Z=0–48), 480 segments and approximately 2.7-unit water width. Only 48 small rocks and 72 small grass tufts sit along the banks. Another 36 grass clumps and 56 small pebbles sit on the terraces throughout the whole river; no trees or final-only landscape reveal.
- Softened reflected ripples: normal strength .12/.09, repeat 2/18, flow offset .003 per second. Pause freezes flow. Reduced motion uses static artwork without a WebGL renderer.
- The final camera turns to frame the gate at the upper right and a diagonal partial river stretch toward the lower left, following the supplied reference image. Faculty copy stays on the left. The faculty panel now enters on the same timeline as other panels instead of appearing over Complete. Narrow-desktop placement keeps scene controls exposed. The final card has a constant width throughout its entrance and holds its position from .98 through 1.
- Darkened muted text; measured minimum panel text/action contrast is **5.02:1**. Preserved opaque white panels, green headings and original messages. Tightened mobile navigation, pinned native-flow controls and corrected short-chapter selection on tablet.

## Camera mapping

Coordinates are scene units, (X,Y,Z). The gate assembly retains normalized progress 0–.52 and its original 520vh travel. Camera, gate and chapter state follow the same reversible scroll progress. Each leg uses smoothstep interpolation for position and look target; no new camera state accumulates on reverse scrolling. Field of view blends 43°→52° during .52–.58, then stays 52°. Bounded inspection rotates the view temporarily and returns softly.

| Progress | Hold | Camera | Look target |
|---|---|---|---|
| .52–.58 | Assembly handoff | Original final assembly pose → (0,6,16) | Original target → (0,-3,5) |
| .625 | Discover | (-3.052,6,21.037) | (-3.052,-3.3,6.037) |
| .715 | Apply | (3.111,6,30.417) | (3.111,-3.3,15.417) |
| .805 | Train | (-3.007,6,39.719) | (-3.007,-3.3,24.719) |
| .895 | Complete | (2.931,6,49.036) | (2.931,-3.3,34.036) |
| .98–1 | Our faculty | (14,16,28) | (-11,-5,6) |

## Five steps: desktop and mobile screenshots

Desktop captures: 1440×900. Mobile captures: 390×844, using the intentional static/native-flow presentation. These are browser viewport emulations, not physical-device performance measurements. Native scrolling may show the beginning of the next chapter; no content is removed to fit a screenshot.

### 1. Discover

Desktop: introductory panel on the left, short river and feathered banks on the right. Small rocks and grass follow the banks and terraces. Mobile: full introduction, public-summary explanation and both actions remain readable below pinned controls.

![Discover desktop](../output/playwright/river/1440-discover.png)
![Discover mobile](../output/playwright/river/mobile-discover.png)

### 2. Apply

Desktop: camera follows the first bend; the application panel sits on the right without scenery crossing its text. Mobile: application/offer/confirmation sequence and opportunity action remain intact, with chapter navigation above.

![Apply desktop](../output/playwright/river/1440-apply.png)
![Apply mobile](../output/playwright/river/mobile-apply.png)

### 3. Train

Desktop: panel returns to the left; rounded grassy banks and gentle waves continue on the right. Mobile: task feedback and independent academic hours approval remain readable, including the explanatory transcript.

![Train desktop](../output/playwright/river/1440-train.png)
![Train mobile](../output/playwright/river/mobile-train.png)

### 4. Complete

Desktop: completion panel on the right, unobstructed river on the left; faculty copy no longer appears prematurely. Mobile: coordinator approval, requirements transcript, progress action and requirements button all remain available.

![Complete desktop](../output/playwright/river/1440-complete.png)
![Complete mobile](../output/playwright/river/mobile-complete.png)

### 5. Our faculty

Desktop: gate and a partial river stretch on the right; university identity, faculty description, Start your journey and six-majors action remain readable on the left. The same live terrain now forms broad green hills around the river; only the outer edges feather into white. Terrain and grounded vegetation stay fixed throughout all five chapters; the camera moves continuously through this same world. Mobile: static/native-flow faculty chapter keeps the logo, complete messages and both actions; it does not reproduce the desktop gate-right camera composition.

![Our faculty desktop](../output/playwright/river/1440-faculty.png)
![Our faculty mobile](../output/playwright/river/mobile-faculty.png)

## Verification

Run `node tools/verify-river-home.cjs` with the repository served at http://127.0.0.1:8080. Result log: [results.json](../output/playwright/river/results.json).

- Five holds at desktop 1440×900, laptop 1366×650 and narrow desktop 1024×768; readable panels, reachable actions, contrast and no horizontal overflow.
- All five chapters at mobile 390×844 and 375×667, tablet 768×1024 and desktop fallbacks.
- Forward/backward camera and gate reversal; position/quaternion continuity around .52, .58 and all five holds. Terrain identity and grounded vegetation matrices remain identical at all five chapters and three intermediate samples, including reverse seeks. The same wide terrain is present throughout and has fully transparent outer grid vertices. Faculty entrance has no width jump; scene/card remain stable from .98 through 1.
- Water stops during Pause and advances on Resume; drag changes view orientation, preserves camera position and returns to baseline. Previous/Next, keyboard focus, Replay and six-majors dialog pass.
- [Reduced motion](../output/playwright/river/reduced-full.png), [WebGL unavailable](../output/playwright/river/webgl-unavailable-full.png), [context loss](../output/playwright/river/context-lost.png), [no JavaScript](../output/playwright/river/no-javascript.png) and hidden-tab pause pass. No runtime errors.
- Static modes contain no live renderer and show all five transcripts. Small/mobile screenshots are also captured per chapter; complete fallback documents are available as `*-full.png`.

Still screenshots demonstrate composition, not animation. The water/pause and camera checks above verify motion separately. Screenshot assets and machine results remain local in ignored `output/playwright/river/`.
