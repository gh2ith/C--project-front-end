# River pathway — implementation and review note

Used image-to-code for the generated detail study and image analysis; used motionmaxxing's single-world, physically connected handoff, readable staging and seek-safe state principles. The owner's final instruction extends the reference banks across the whole river.

## Changes

- One continuous sculpted terrain surface now spans both sides of the entire river. Broad grassy terraces, rounded asymmetric outer lobes and a soft shoreline ramp replace the narrow strips and final-only widening.
- Fine matte grass replaces harsh noise; low seven-leaf clusters and small pale stones stay grounded using the same terrain-height function. A level landing supports the gate without burying the plinths or excavating holes around them.
- Grass and land remain the same at all chapter holds. Camera and panels retain the existing reversible timeline, pause, Replay and inspection. Perimeter alpha reaches zero before every outer grid boundary.
- The river centerline remains 51.55 scene units (Z 0–48). Final camera remains (14,16,28), looking at (-11,-5,6).

## What is real / illustrative

University logo, interface copy, links and chapter controls are existing project assets. River, gate and grass are procedural illustrative Three.js geometry. The generated PNG is a design study only; it is never rendered as the runtime scene or a texture plate.

Built-in image generation produced [the study](../../output/playwright/pathway/reference-generated.png) before implementation. Owner reference: [image](../../output/playwright/pathway/reference-owner.png).

Prompt: “Generate a fresh large standalone 3D landscape detail reference for implementation, based precisely on the attached user reference. Show ONLY its grassy riverbanks/pathway, teal river and limestone gate, no website text, logos, cards or controls. Preserve this composition: gate upper right, river flows from gate in a gentle S diagonally down to lower left. The wide olive green land beside both sides of river is continuous with rounded mounds, a shallow smoothly sloped channel, an open grass walking surface, tiny ivory scattered stones and distinct low spiky grass clusters. In particular the left bank is a broad rounded hill/terrace with irregular bulging outer silhouette; right bank spreads wide and undulates, not two narrow parallel strips. Land at least two river widths on each side. Soft directional light, matte fine grass, soft shadows, white background, irregular land perimeter softly feathers into white. Match the attached reference land proportions, slopes, shoreline and grass clumps closely; do not add a dirt path, paving, canyon cliffs, trees, extra gates or tall vegetation. This image is a study reference only; runtime will remain actual Three.js geometry.”

## Evidence

`node tools/verify-river-home.cjs` tests 15 desktop hold views across 1440×900, 1366×650 and 1024×768, plus mobile 390×844 and 375×667, tablet, reduced motion, unavailable WebGL, context loss and no JavaScript. The same land geometry and vegetation matrices persist through eight journey/transition samples and return exactly after reverse seeking. The measured land span exceeds 9 scene units at five longitudinal samples, with a fully transparent outer grid boundary. Panel text/action contrast minimum: 5.02:1. Pause/resume flow, drag/return, keyboard focus, chapter controls, Replay and final hold pass. No browser runtime errors.

These are browser/geometry assertions, not a claim of pixel-for-pixel identity or a physical-device frame-rate guarantee. The reference is a raster view while this remains a movable 3D scene.

## Looked-at frames

1. [Discover](../../output/playwright/pathway/discover.png): a broad grassy river corridor fills the right, with the left introductory panel clear.
2. [Apply](../../output/playwright/pathway/apply.png): the left-side bend retains the broad path and grounded detail while the application panel sits right.
3. [Train](../../output/playwright/pathway/train.png): the next bend has the same land width and vegetation language, with no landscape replacement.
4. [Complete](../../output/playwright/pathway/complete.png): the wide banks continue toward the gate before the final camera turn.
5. [Our faculty](../../output/playwright/pathway/faculty.png): the diagonal river crosses rounded green terraces below the gate, beside the left faculty panel.

[Forward/reverse browser recording](../../output/playwright/pathway/pathway-scroll.webm), captured by `tools/capture-river-pathway.cjs`.

## Motion skill scope

This is an interactive website, so promotional-film G1/G3/G5 rules about large UI fragments, short end cards and removing navigation do not apply to the requested site. No G0–G5 film pass is claimed. The provider probe did not find the film-render toolchain on PATH; the existing Windows Chrome/Playwright runtime and its bundled video recorder were used for browser verification. No sound was requested or added. The equivalent acceptance evidence is the browser suite, viewed stills, outer-edge checks and exact seek reversibility above.

Remaining visual limitation: a stylized live mesh cannot reproduce every pixel of the supplied raster at every camera angle. The land contour, terrace width, material, plant scale and shoreline were compared directly against the source; the five chapter compositions and interactions remain usable.

## Broader meanders revision

The owner requested bigger bends, a wider actual river and more scroll travel. Centerline is now 100.59 units (Z0–84); main water is about 5.4 units wide, tapering smoothly at the gate. The river scroll increases from 480vh to 880vh while the original gate assembly remains 520vh. Camera holds vary height and side angle, staying within 25 units of their river samples. The same final gate/right and faculty/left composition remains. Updated browser checks pass across all desktop sizes, static mobile, reduced motion, WebGL failure, reverse seeking and controls. Updated five-frame captures and forward/reverse recording use the same linked paths above. This is still an interactive-site review; no film gates are claimed.

## Faster scroll, real bends, then comfort correction

The final river uses rounded S-bends spanning approximately 22 units and a 114.80-unit centerline. River scroll is back to 480vh, 45% less than the preceding 880vh revision; the assembly stays 520vh. After the owner reported motion sickness, automatic lateral camera motion, yaw changes and elevation changes were removed. Only forward Z changes at a fixed viewing angle. The camera settles at Complete; the final reframe occurs at .94 only while scene opacity is zero, between soft fades. Cards stay still and fade without scaling. Input smoothing is 100ms. Browser assertions verify fixed camera orientation/height, monotonically forward travel, hidden reframing, reverse state, all holds and interactions, contrast and static fallbacks. All pass. These checks verify behavior, not personal motion comfort. The linked five screenshots and forward/reverse preview have been recaptured.

## Continuous finale correction

The owner rejected the hidden reframe and stationary angle. Removed the scene fade and camera reset. A single Hermite camera route now returns toward the gate earlier, during Train, then approaches the final pose continuously through Complete. Small tangent-based heading changes and partial lateral tracking follow the river; no roll or sudden zoom. All sections fade in over .03 progress at fixed size and position. Scene opacity stays 1. New browser checks sample the whole route for jumps, verify camera angle changes, check intermediate finale continuity, and measure each section fading from low to intermediate to full opacity without transform changes. The full interaction/contrast/desktop/mobile/fallback suite passes. The preview and five screenshots have been recaptured; no physical-device or subjective comfort guarantee is claimed.

## Latest implemented finale

The approved shadowed concept is translated into actual live geometry, not a bitmap plate. Gate is farther right and grows to1.65 on the approach; final camera(16,30,59), target(-14,4,27) at900px viewport height. Its target height adapts to shorter desktops. Returning river bend is shown beneath the typography. Water width increases from5.4 to about7 units; full114.80-unit river route is restored for chapter views. The finale is unboxed type on white with the duplicate logo/icon removed. Emerald elliptical atmosphere, localized reading light, lower-key lighting and a blurred ground-contact texture blend in reversibly. The contact texture is explicitly feathered to zero alpha at every edge to remove rectangular clipping. Scroll split:520vh assembly +380vh chapter travel +240vh final approach +20vh hold. Scene stays fully visible throughout.

Design inspection: source lint reports zero findings. The generic browser inspector flagged gradients, lack of photographs/video, hidden inactive headings and long pinning: the approved emerald fade, procedural live artwork and intentional reversible pinned scene are explicit owner requirements. They were recorded as allowances, not described as ordinary page failures repaired by adding photography. Dedicated browser checks verify active headings/actions are unobstructed, gate projection stays right/below controls at1440x900,1366x650,1024x768, and all five chapters, reverse state, fades, contrast, pause, drag, dialogs, Replay, static mobile and fallbacks pass. Measured minimum text/action contrast5.02:1. The generated concept remains a reference; its denser photographic grass and water texture are not claimed as pixel-identical to the procedural mesh.

Laptop follow-up: fixed targetY4 and smooth screen-space lens correction keep the right-side gate and returning river visible on short browser viewports. Resizing preserves timeline progress. All five holds now pass at eight desktop/laptop dimensions; gate stays below controls and inside the viewport. Local laptop-specific screenshots are linked from the acceptance report.

## Final-only gate enlargement and removed toolbar

The latest owner explicitly requested removing the entire Step/Replay/Drag/Pause toolbar. It is removed from the DOM in desktop and static modes; native chapter navigation, Home, previous/next and direct drag inspection remain. The internal motion test hook still supports pause/resume verification. Gate scale stays1 throughout the earlier scene and grows smoothly to2.25 only over .895–.98, grounded at the same footings: about36% larger than the preceding1.65 finale. Final screen framing targets86% width with a measured projected-bounds limit at98%, keeping the entire lintel visible at laptop widths. The original assembly geometry and earlier gate size are unchanged. Static chapter scroll offsets no longer reserve the removed toolbar space.

Homepage shape-only follow-up: replaced the speculative Roman semicircle/lintel with32 curved extruded rim stones in the supplied emblem's pointed silhouette. Original stone materials and six assembly tiers are retained; only contour geometry and matching luminous/static outlines change. River, camera, scene layout and timeline are preserved. No historic-origin claim is made for this illustrative gate.
