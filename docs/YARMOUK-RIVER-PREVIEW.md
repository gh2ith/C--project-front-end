# Yarmouk River local preview

The stone gate still assembles first. Its continuation is now a sculpted 3D river with flowing water, sloped banks and a recessed riverbed. Rocks, reeds, shrubs and trees populate both sides. Large readable sections alternate banks as the camera follows the bends. The final camera movement reveals the complete river and gate together on white ground.

The owner's supplied recording informs the path and alternating panel presentation. This is artistic river scenery, not a surveyed reconstruction. No session records or portal workflows change; keep yarmouk:uims:v1. Nothing is published.

Timeline:
- 0–.52: original gate assembly (520vh).
- .52–.605: river emergence and camera handoff.
- .625: Discover hold, left bank.
- .715: Apply hold, right bank.
- .805: Train hold, left bank.
- .895: Complete hold, right bank.
- .895–.99: pull back to the complete model.
- .98–1: faculty and university overview, with the final action on the right.

Implementation: procedural cross-section terrain, a flat water surface recessed within the channel, lightweight shader ripples, reused instanced vegetation and rocks, soft directional shadows. 44 trunks, 132 overlapping foliage crowns, 60 shrubs, 64 bank stones and 96 reeds. Water animation pauses with the existing control. Scrolling remains reversible. Mobile/tablet, reduced motion, missing WebGL and no-JavaScript content remain readable.

Validation: tools/verify-river-home.cjs passes desktop hold/layout checks at 1440×900, 1366×650 and 1024×768; 390×844 and 375×667 mobile; 768×1024 tablet; reduced motion, missing WebGL, lost context and disabled JavaScript. Also checks camera continuity/reversal, physical terrain depth, final pullback, two banks between holds, navigation, drag, pause, keyboard, replay and six majors. No runtime errors or inline style attributes. Measured close view: 12 draw calls and 28,770 visible triangles at pixel ratio 1 (not a physical-device FPS guarantee). Source lint and syntax checks pass. Screenshots: output/river/.
