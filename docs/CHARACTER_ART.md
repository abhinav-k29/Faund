# Wilsee companion art

The original six species and companion identities are preserved. The models and card illustrations share a restrained garden palette, curved silhouettes, small expressive eyes, and species-specific structure. These are fictional companions inspired by real organisms, not biological identification models.

## Anatomy and progression

| Companion                | Structural identity                                                                                                                                                                 | Stage changes                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Pipwing / lorikeet       | Pear-shaped torso, blue-grey crown, warm nectar bib, hooked parrot bill, two folded feathered wings, fan tail, two bird feet with three front toes and one rear toe                 | A compact fledgling gains longer flight/tail feathers, a wider crest and a restrained warm outer feather at maturity                  |
| Bramblewisp / fairywren  | Small tapered torso, blue cheek mask, fine pointed bill, tucked wings and unusually long upright tail                                                                               | The tail becomes longer and fuller; small cheek feather fans emerge, with five tail feathers at maturity                              |
| Wattlet / wattle         | Root collar and curved stem, five radial branching root tendrils, asymmetric phyllodes, veined leaf surfaces and clustered golden flower heads; no torso, arms, hands, legs or feet | Three flower heads grow into a fuller branching spray, then lateral flowering branches and a wider root system                        |
| Bumbloom / bee           | Separate head, ochre thorax and tapered banded abdomen; six articulated insect legs, two antennae, two pairs of veined wings                                                        | Larger wing surfaces, fictional pollen bundles on hind legs, and a fuller thoracic ruff at maturity                                   |
| Chuckleroot / kookaburra | Broad crown, dark eye stripe, long heavy bill, stout torso, feathered folded wings, barred tail and grasping bird toes                                                              | Longer primary feathers and fuller barred tail, with a slightly wider mature crest                                                    |
| Mistleaf / eucalyptus    | Tapered irregular bark trunk, six radial branching roots, small eyes integrated in the trunk, branching canopy and narrow drooping veined eucalyptus leaves; no humanoid anatomy    | A small three-branch sapling gains side branches and capsules; maturity adds a higher branching canopy, more leaves and seed capsules |

SVG portraits use the same root-based plant shapes, four-wing/six-leg bee anatomy, beaks, feather palettes and bird silhouettes. Stage changes add structure instead of a universal crown. SVG gradient and clip IDs are unique per rendered instance, avoiding collisions across Collection cards.

## Motion and contact

Plants keep their root collar fixed to the ground. Radial roots alternate a small recovery curl while the remaining roots support the plant. The motion is deliberately slow; it is a rooted shuffle in place, not a human walk or whole-body bounce. Canopies sway around the stem junction. The bee has a restrained hover and fast small wing strokes. Birds keep both feet planted, move their heads slightly and make small tail/wing adjustments. Eyes blink occasionally.

All idle motion receives the existing reduced-motion flag. Reduced-motion views hold a stable pose, with orbit interaction still available. Motion pauses through the existing visibility/frameloop controls.

## Geometry, materials and ownership

`src/companion-models.tsx` contains hand-directed procedural forms: sectioned organic body surfaces, curved tapered tubes, convex pointed leaf/feather surfaces with raised midribs, and radial root meshes. The forms remain legible without texture maps. There are no remote model or texture downloads.

Common body, leaf, feather, bee-band, round-detail and flower geometries and a small material palette are shared. The clustered flower florets are merged by colour to reduce draw calls. Shared meshes opt out of automatic disposal so switching a model cannot destroy resources still used by another instance. Temporary geometry used for merging is disposed immediately. Each animated root owns one small buffer, updates it in place, and disposes it on unmount. Scene canvases retain their existing lifecycle, visibility and resolution cap.

Static habitat details are instanced by shape and colour: flower petals/centres/stems, tree canopies/trunks, reeds and stones keep their original transforms and palette. Large trees/hills retain their original tessellation; tiny petals/stones use a smaller smooth sphere. These three environment geometries and their finite material palette are shared. Each batch explicitly disposes its own instance-matrix buffers when replaced, without disposing shapes/materials used by other batches.

Materials distinguish matte feather/fuzz, waxier leaf surfaces, rough bark and translucent insect wings. Lighting combines a warm key, cool fill and hemisphere bounce. Balanced quality uses a 768-pixel variance shadow map with a small blur budget and DPR capped at 1.5; low quality caps DPR at 1 and omits dynamic shadows. All model geometry is local and bounded; no generated assets, AI images or copyrighted character models are used.

The world view brings the companions closer with larger models and a lower camera. Mature Mistleaf has a deliberately lower, wider asymmetrical crown so its full root-to-leaf silhouette fits its portrait. Bird chest colours are surfaces conforming to the underlying torso rather than intersecting decorative spheres. Head profiles use extra smooth samples selectively; leaf and small detail tessellation remains compact. Portrait birds and the bee turn slightly farther from the camera to reveal their bill, tail, wing and abdomen silhouettes; plants retain their more frontal stem-and-root view.

`SceneCanvas` reports renderer draw calls, triangles, resident geometries/textures and observed frame interval as DOM data attributes about once per second. Positive visible-frame intervals include stalls; only the first frame after visibility/resume is excluded because its clock interval contains paused time. Sample count and intervals over 50 ms are also exposed. Frame interval is a desktop diagnostic, not measured GPU time or a phone frame-rate promise. Counts include the current environment and shadows. The diagnostics update attributes without triggering React renders. A cleaned-up context-loss listener moves the wrapper to its illustrated fallback. Button/keyboard camera commands rotate by 22.5 degrees and zoom within the same limits as OrbitControls.

This remains a deliberately compact procedural prototype asset set. It does not claim production character rigging, skeletal locomotion or photorealistic species anatomy. Desktop software-WebGL verification does not replace physical phone performance checks.
