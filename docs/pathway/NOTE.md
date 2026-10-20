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
