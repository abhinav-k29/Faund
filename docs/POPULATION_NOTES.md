# Population and polish pass

The existing routes, typography, palette, card system, biomes, 3D models, Tasks and researcher workspace are retained. A source checkpoint was saved as `checkpoints/before-population-polish.zip`.

## Presentation entry

New explorers choose Demo Explorer by default, but data is created only after the unchecked adult affirmation and research agreement are accepted. Fresh Explorer remains available during consent and under Profile. Reset remembers that deliberate choice, so consent and reload do not silently reseed it. Existing stored observations, consent, task edits, XP and companion growth are migrated without replacement. An older, consented, completely empty profile with no saved start preference or game progress adopts the presentation default. Loading Demo Explorer explicitly replaces observation/game progress with the shared samples.

## One connected dataset

The seed contains 24 fictional observations, six species and companions, eight named public-area examples and three populated biomes. Visits span September and October 2026. Each has a distinct note, date/time, method, location uncertainty, review status and consent link. Creation timestamps follow observation timestamps. Reviewed entries have clearly simulated review notes. The unidentified final record demonstrates sensitive-location handling.

Centennial Park has four observations, the Botanic Garden flowering edge four, Sydney Park three, the campus tree walk three, Bicentennial Park three, Hyde Park three, Coogee garden two and the campus courtyard two. Sensitive records remain in private history but have no geographic pin and no visible list locality. Research exports continue to omit precise coordinates and withhold sensitive locality/site identifiers.

Urban Tree Watch and Bird Spotter are completed. Seasonal Bird Survey and Leaf Explorer are ready for their one-time reward. Pollinator Watch is four of five distinct visits at the same Botanic Garden site. The fifth task-linked bee observation advances the same task progress and researcher records; no screen uses a separate scientific dataset.

## Targeted interface changes

| Files | Changes |
| --- | --- |
| `src/store.ts`, `src/participation.tsx` | Rich seed, explicit start preference, consent-first default and compatible migration |
| `src/pages.tsx` | Active/completed Tasks counts, ongoing research highlight, recent journal entry, six-card Collection connections, stages and biome/growth labels |
| `src/observation-map.tsx` | Task focus URL, highlighted survey area, populated visit details with time/habitat/project/notes, chronological list and sensitive pin withholding |
| `src/bee-panel.tsx`, `src/discovery.tsx` | Visible bee field entry and comparison guidance, uncertainty actions, retained uploaded photo on result, correct biome when visiting from a card |
| `src/worlds.tsx` | Owned companion counts per biome; existing scenes and care controls preserved |
| `src/research.tsx`, `src/research-projects.tsx` | Visible project links and a recommended public survey-area selector in Task Builder |
| `src/upgrades.css` | Small extensions using the approved visual tokens |
| `tests/population.mjs` | Consent/default/fresh modes, task map focus with and without records, bee-to-world chain, shared researcher progress and photo retention |

Take Me There highlights an area; it does not offer live navigation or estimated walk times. Recommended areas without captured records use an area circle, never a fake observation pin. Start Task Here adds the selected named site if needed and carries it into the existing recording flow.

The bee entry is curated sample information. A user photo is never classified or silently replaced by the sample. Species-level uncertainty remains explicit. Community Worlds still receive only curated fictional game assets; observation records never enter their public schema.
