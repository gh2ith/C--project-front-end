# Homepage scene acceptance — October 21, 2026

Desktop uses the reversible WebGL scene; mobile/tablet (900px and below), reduced motion and unavailable WebGL deliberately use the existing static gate/river introduction and five native-flow chapters. Mobile does not run the desktop camera or drag interaction. All original chapter messages, transcripts and actions remain intact.

## What changed

- Replaced the former field with a continuous distance-based terrain mesh. All river chapters now use the same broad rounded grassy terraces, with feathered edges fading to white. A distance-based surface prevents folded strips at river bends.
- Extended the river to **114.80 scene units along its centerline**, with an **84-unit longitudinal extent** (Z=0–84), 720 segments and approximately **7-unit water width** (6.6–7.4 along the main river). The gate throat stays narrow and opens gradually. Rounded S-bends span about 22 units across. Only 48 small rocks and 72 small grass tufts sit along the banks. Another 36 grass clumps and 56 small pebbles sit on the terraces throughout the whole river; no trees or final-only landscape reveal.
- Softened reflected ripples: normal strength .12/.09, repeat 2/18, flow offset .003 per second. Pause freezes flow. Reduced motion uses static artwork without a WebGL renderer.
- The visible camera path continuously approaches the gate at the upper right and a diagonal partial river stretch toward the lower left, following the supplied reference image. Faculty copy stays on the left. The faculty panel fades in while the camera arrives at the gate. Narrow-desktop placement keeps scene controls exposed. The final card is removed: larger typography sits directly on the page, with no repeated logo or illustration tile. The gate grows smoothly to 1.65 times its original size, stays grounded, and appears farther right. The final view shows the returning S-bend. Emerald atmosphere, lighting and feathered landscape contact shading blend in over .895–.98.
- Darkened muted text; measured minimum panel text/action contrast is **5.02:1**. Preserved opaque white panels, green headings and original messages. Tightened mobile navigation, pinned native-flow controls and corrected short-chapter selection on tablet.

## Camera mapping

Coordinates are scene units, (X,Y,Z). River centerline remains **114.80 units**, Z0–84, 720 segments. Main water is now **about 7 units wide**, roughly 30% wider than the previous 5.4. Gate throat opens smoothly from 2.7 units. The full river is used: each chapter reaches a different bend at arc fractions .12/.32/.52/.72.

Runway is 1260vh (1160vh scroll): 520vh assembly, 380vh to Complete, 240vh for the continuous gate approach, then 20vh final hold. Piecewise mapping: (scroll vh, progress) = (0,0), (520,.52), (900,.895), (1140,.98), (1160,1). Navigation uses the exact inverse.

Time-aware Hermite position/look interpolation carries velocity through the reading chapters. Lateral tracking is 50% of river X plus alternating 3.8-unit framing offsets; tangent heading is scaled to 20% and capped at ±.22 radians. River camera heights 8/8/9/11, with 18-unit forward offset. Final camera (16,30,59) looks at (-14,4,27) on a 900px-high desktop. The look target stays fixed at Y4 at every laptop height. A final-stage lens view offset places the gate center at 82% of viewport width without rotating or resizing the world. This preserves the returning bend on short laptop screens. Lens stays at 52° after handoff; no roll. Gate scale grows 1→1.65 over .895–.98, with its footings held at the same ground height.

Scene opacity stays 1. The same live meshes approach the finale with no reset or image replacement. Emerald background is an elliptical atmosphere with a smooth full perimeter, not a rectangular plate. Contact-shadow texture alpha reaches zero on every outer pixel; a localized oval reading light keeps text on white while preserving the returning bend below it. Lighting and terrain shade deepen gradually. Each section fades in over .03 progress and out over .018 with no translation or scale. Input smoothing: 100ms. Static/reduced-motion modes remain readable native-flow chapters.

| Progress | Hold | Camera | Look target |
|---|---|---|---|
| .52–.58 | Assembly handoff | Original pose → (0,8,20) | Original target → (0,-3.3,5) |
| 0.625 | Discover | (2.259,8,28.596) | (-0.858,-3.3,10.868) |
| 0.715 | Apply | (2.047,8,47.147) | (5.975,-3.3,29.581) |
| 0.805 | Train | (-8.467,9,61.509) | (-9.216,-3.3,43.524) |
| 0.895 | Complete | (10.221,11,73.769) | (7.304,-3.3,56.007) |
| .98–1 | Our faculty (900px height) | (16,30,59) | (-14,4,27) |

## Five steps: desktop and mobile screenshots

Desktop captures: 1440×900. Mobile captures: 390×844, using the intentional static/native-flow presentation. These are browser viewport emulations, not physical-device performance measurements. Native scrolling may show the beginning of the next chapter; no content is removed to fit a screenshot.

### 1. Discover

Desktop: introductory panel on the left, wider river and feathered banks on the right. Small rocks and grass follow the banks and terraces. Mobile: full introduction, public-summary explanation and both actions remain readable below pinned controls.

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

Desktop: gate and a partial river stretch on the right; large closing typography, faculty description, Start your journey and six-majors action remain readable on the left. The same live terrain now forms broad green hills around the river; only the outer edges feather into white. Terrain and grounded vegetation stay fixed throughout all five chapters; the camera moves continuously through this same world. Mobile: static/native-flow faculty chapter keeps the logo, complete messages and both actions; it does not reproduce the desktop gate-right camera composition.

![Our faculty desktop](../output/playwright/river/1440-faculty.png)
![Our faculty mobile](../output/playwright/river/mobile-faculty.png)

## Verification

Run `node tools/verify-river-home.cjs` with the repository served at http://127.0.0.1:8080. Result log: [results.json](../output/playwright/river/results.json).

- Five holds at desktop 1440×900, 1536×730, 1366×768, 1366×650, 1280×720, 1280×650, 1024×768 and 1024×650; readable panels, reachable actions, contrast and no horizontal overflow.
- All five chapters at mobile 390×844 and 375×667, tablet 768×1024 and desktop fallbacks.
- Forward/backward camera and gate reversal; position/quaternion continuity around .52, .58 and all five holds. Terrain identity and grounded vegetation matrices remain identical at all five chapters and three intermediate samples, including reverse seeks. The same wide terrain is present throughout and has fully transparent outer grid vertices. Faculty entrance has no width jump; scene/card remain stable from .98 through 1.
- Water stops during Pause and advances on Resume; drag changes view orientation, preserves camera position and returns to baseline. Previous/Next, keyboard focus, Replay and six-majors dialog pass.
- [Reduced motion](../output/playwright/river/reduced-full.png), [WebGL unavailable](../output/playwright/river/webgl-unavailable-full.png), [context loss](../output/playwright/river/context-lost.png), [no JavaScript](../output/playwright/river/no-javascript.png) and hidden-tab pause pass. No runtime errors.
- Static modes contain no live renderer and show all five transcripts. Small/mobile screenshots are also captured per chapter; complete fallback documents are available as `*-full.png`.

Still screenshots demonstrate composition, not animation. The water/pause and camera checks above verify motion separately. Screenshot assets and machine results remain local in ignored `output/playwright/river/`.

## Laptop composition correction

Removed the height-dependent upward look target that pushed the landscape below the laptop viewport. Final target is (-14,4,27); camera (16,30,59), gate scale1.65, river width and all scene objects remain unchanged. Lens offset gently enters with the final approach and aligns the gate around82% of viewport width. It resets during the opening/reverse journey. Window resizing preserves normalized animation progress using the inverse scroll mapping. No global page scaling or browser-zoom workaround.

All five holds pass at eight desktop sizes, including laptop browser content heights650–768px. Gate projection stays right of the copy, inside the viewport and below controls. Active headings/actions remain unobstructed. Resize tests preserve Apply, Complete and final progress across1366x650,1280x720,1440x900. Dedicated screenshots: [1366x650](../output/playwright/pathway/laptop-1366-650.png), [1280x720](../output/playwright/pathway/laptop-1280-720.png), [1536x730](../output/playwright/pathway/laptop-1536-730.png). Screenshots are local and ignored by Git.

## Final-only gate enlargement and removed toolbar

The latest owner explicitly requested removing the entire Step/Replay/Drag/Pause toolbar. It is removed from the DOM in desktop and static modes; native chapter navigation, Home, previous/next and direct drag inspection remain. The internal motion test hook still supports pause/resume verification. Gate scale stays1 throughout the earlier scene and grows smoothly to2.25 only over .895–.98, grounded at the same footings: about36% larger than the preceding1.65 finale. Final screen framing targets86% width with a measured projected-bounds limit at98%, keeping the entire lintel visible at laptop widths. The original assembly geometry and earlier gate size are unchanged. Static chapter scroll offsets no longer reserve the removed toolbar space.

## Gate silhouette replacement

Grass alignment correction: restore the gate geometry preceding the misunderstood shape refinement. Extend the existing grass mesh's opaque landing under both final-scale feet (X up to±7.88) with an elliptical feather extending to±10.5, blending into the original banks over5 Z units. No extra mesh, gate change, camera change or timeline-dependent terrain swap.

Latest scope is shape only. The speculative Roman geometry is replaced by32 beveled extruded stone rim pieces following the supplied emblem's pointed/ogee profile. Flared feet remain grounded atY-3.3; curved shoulders meet at a pointed crown. No horizontal lintel or Roman capitals remain. Updated the luminous contour and native static/mobile SVG gate outlines to match. Six assembly tiers, deterministic scatter, reverse seeking, river, final scale2.25, camera mapping, backdrop, page typography and timing retain their existing behavior. Current final screenshot and recording use the same linked paths. The acceptance suite additionally checks32 named extruded rim meshes and the pointed-gate identifier.

## Gate-only homepage — latest owner correction

Removed the river/terrain/water construction and update code, route cameras, post-assembly lighting changes and landscape backdrop elements. The five copy stages now occur once during the original gate assembly. Runway620vh gives520vh of reversible assembly scroll and ends with the completed gate; no later river sequence. Static/mobile artwork no longer includes a river.

Verified with node tools/verify-gate-only-home.cjs: forward/backward seeking, end position, no river scene objects, Home replay, majors dialog, mobile/reduced-motion/WebGL fallbacks and no runtime errors. Final screenshot: output/gate-only/completed.png. Earlier river tests above describe superseded behavior.
