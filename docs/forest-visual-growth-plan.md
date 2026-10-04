# Forest visuals and continuous growth

Status: tree renderer, continuous growth, and interactive preview implemented on 2026-10-04. Landscape and wildlife upgrade completed in the follow-up on 2026-10-04.

Implemented: deterministic bounded branch geometry; tapered shaded bark, roots, and pointed layered leaves; seven presentation stages; a continuous emergence curve; interrupted-update interpolation; continuous health color/coverage and recovery; demo-only timeline scrubbing, playback, condition and meal controls; shared personal/forest/visit renderer; live milestone progress; viewport culling, bounded tree caches, offscreen suspension, and reduced-motion rendering.

Validation: 19 automated tests passed, including geometry continuity, stable attachment points, bounded old-tree complexity, transition interruption, and existing simulation/API/showcase tests. TypeScript and ESLint pass. Desktop and 390px phone layouts were inspected in the browser. Physical-device frame-rate targets and a production build have not been verified in this pass.

Compatibility: meal scoring, API stage names, and earned growth are unchanged. The dimensions helper preserves existing adult curves and makes the first 0.6 growth credits emerge continuously from zero. Illustrative preview states hide actual meal history, age, dimensions, and impact totals.

## Direction

Create a detailed, stylized game diorama: believable tree anatomy, tactile bark, layered leaves, soft sunlight, and a small living landscape. Use natural proportions with deliberately composed colors and shapes. The tree should feel like an individual living object that the student recognizes between visits.

Start with one excellent broadleaf tree family. Use stable seeded variation for trunk lean, branching, crown asymmetry, bark, and leaf placement. Additional species come after the first family works across its entire life cycle.

Build a layered 2.5D scene through the existing shared canvas entry point. Separate structural geometry from drawing so a future renderer can consume the same tree definition. The first delivery is a high-detail close-up prototype, with a mobile performance check before scaling to the forest. Do not add a second rendering stack during this pass.

## Findings in the current implementation

- `tree-painter.ts` represents foliage mainly as overlapping flat ellipses. Branches have little taper, bark detail, depth, or attachment shading.
- The seed drawing ends at growth 0.12, while the simulation labels every positive value as a sprout. At growth 3, the two-leaf drawing is replaced by a branching tree. These switches can visibly jump.
- Branch IDs currently use overlapping numeric ranges across roots and descendants. Replace them with unique ancestry paths to support reliable persistent identities.
- Health palettes switch at hard thresholds and leaves disappear through a hard visibility cutoff. Recovery needs gradual color, angle, and coverage transitions.
- `world.tsx` fits the close-up using the target growth value while the tree itself animates. Its fit calculation considers height but not the full crown bounds, so growth can be hidden by rescaling and wide branches can exceed the frame.
- The forest changes branch depth at a zoom threshold. Zooming can change the apparent crown instead of only its detail.
- The ground, distant environment, and lighting are very simple. Grass decoration is repeated identically between personal scenes.
- The demo starts with an already developed tree and offers meal buttons, but cannot directly demonstrate the full growth journey.

## Visual treatment

| Layer | Planned treatment |
| --- | --- |
| Silhouette | A tapered trunk, natural forks, uneven crown masses, and deliberate gaps showing internal branches. |
| Bark | Warm shadow and light planes, fine grooves, restrained knots, and thicker texture on older wood. Details follow branch direction. |
| Branches | Curved tapered segments with attached forks, darker junctions, smaller twigs, and visible young tips. |
| Foliage | Rear, middle, and front clusters; individual leaf shapes at close range; darker interior leaves and warm sunlit edges. Avoid uniform circular clumps. |
| Roots | A subtle root flare and exposed roots that thicken into the ground as the tree matures. |
| Ground | A shaped soil patch with a visible edge, moss, grass tufts, pebbles, fallen leaves, and a few flowers. Stable decoration with clear space around the trunk. |
| Light | One consistent sunlight direction, soft cast shadows, contact shadows beneath roots, and restrained canopy shading. |
| Background | Soft distant vegetation, light atmospheric depth, and a calm sky or clearing appropriate to the shared scene framing. |
| Movement | Strong trunk stability, more motion in small branches, leaf flutter, and occasional insects. All motion is subtle and spatially coordinated. |

Keep the tree as the focal point. Place information around its silhouette. On mobile, place secondary statistics below the scene and preserve large touch controls. Use the same palette, light direction, materials, and decoration vocabulary in every preview and forest view.

## Growth stages

These are proposed presentation milestones over the existing earned `growth` value. Thresholds are growth credits, not days or promised numbers of meals. Calendar age remains separate. Preserve the current boundaries at 3, 14, and 60; add emergence and later-life detail without changing meal scoring.

| Visual stage | Growth | Development |
| --- | --- | --- |
| Seed / Tohum | 0 | A detailed seed nestled in soil with a stable planting position. |
| Emergence / Çimlenme | Above 0 to below 0.6 | The seed opens, a shoot gradually rises, and cotyledons unfold. At values near zero the result stays visually close to the seed. |
| Sprout / Filiz | 0.6 to below 3 | The stem lengthens, cotyledons remain visible, and the first true leaves open. |
| Sapling / Fidan | 3 to below 14 | A woody stem develops, lateral branches extend, and the first small crown forms. Cotyledons fade as true foliage takes over. |
| Young tree / Genç ağaç | 14 to below 60 | Main limbs strengthen, secondary branches fill out, the crown gains volume, and a root flare becomes visible. |
| Established tree / Kök salan ağaç | 60 to below 160 | A fuller asymmetric crown, thicker trunk, stronger roots, richer bark, and more layered foliage. |
| Veteran tree / Köklü ağaç | 160 onward | Slower height gains; continued girth, spreading crown, deeper bark, and ongoing shoot development. There is no final completed tree. |

The extra labels are presentation substages initially. Keep the existing API `stage` field compatible; derive scene labels and progress from a shared visual growth profile. Any later change to canonical labels must update the model, consumers, and tests together.

## Continuous development

1. **One persistent skeleton.** Generate a deterministic branch graph using seed, generator version, and unique ancestry IDs such as `trunk/left-2/right-1`. Growth reveals and extends that graph; it never rerolls the tree.
2. **Independent development channels.** Derive stem length, trunk thickness, branch extension, root spread, leaf opening, and crown coverage from continuous curves. A stage boundary only changes the caption.
3. **Overlapping growth windows.** A branch begins as a bud, extends, thickens, then gains unfolding leaves. Parent development constrains children so forks remain attached. Blend adjacent phases over shared intervals.
4. **Persistent attachment points.** Anchor branches to positions along their parent curves and leaves to their supporting twigs. Recompute those positions when parents bend or extend.
5. **Continuous emergence.** Use a dedicated germination curve starting at zero, avoiding a fixed minimum shoot height that appears instantly after the first credit.
6. **Local reward animation.** A new earned increment animates the affected shoots, leaves, and thickness over roughly 1.5–3 seconds. Small increments still create a localized visible response without exaggerating the stored gain. Large catch-ups use a bounded summary animation.
7. **Interruptible transitions.** If another update arrives mid-animation, start from the currently displayed state. Polling with unchanged values must not replay growth. Animate camera framing from the same displayed state.
8. **No idle credit.** Time on the page drives wind and ambient life only. Meals drive earned development. Absence does not reduce health or growth.
9. **Continued maturity.** Use diminishing size curves and bounded visual complexity. Far-later growth still changes proportions, girth, and shoot development; do not keep adding unlimited branch objects.

Use one shared dimensions profile for measured height, width, trunk size, and visual proportions. Introduce the new birth curve explicitly and update dimension expectations together; do not quietly change displayed meters as a side effect of artwork. The forest can compress scale for layout, but the close-up and statistics must remain consistent.

Keep a stable close-up scale while the tree fits. Ease the camera outward only when actual crown and root bounds enter a safe margin. Retain a ground reference such as a pebble cluster so a growing tree feels larger. Long-lived trees must fit without covering controls or clipping branches.

## Health and recovery

Health and maturity are separate inputs. Preserve the earned woody structure during stress.

- High vitality: upright leaves, rich color variation, dense foliage, restrained ambient activity.
- Moderate stress: gently reduced saturation, lower leaf angles, less new foliage, quieter surroundings.
- Greater stress: progressively sparser leaf coverage and drooping small twigs; the tree remains visibly alive.
- Recovery: leaves lift and regain color, then coverage returns smoothly. Reuse the same leaf identities.

Use continuous blends instead of switching palettes or deleting clusters at thresholds. Fade and unfold individual leaves using stable ordering. Keep reduced-motion states equally informative through final shape, color, and text. Seasonal decoration is a later feature and must be distinguishable from health.

## Preview and forest experience

### Personal preview

- Make the detailed diorama the main visual surface, with one compact stage and vitality summary.
- Add a clearly labeled demo growth timeline with stage markers, a continuous slider, and play/pause. Scrubbing demonstrates intermediate structure rather than swapping pictures.
- Offer separate demo controls for vitality, recovery, and one good or poor meal. Explain when a chosen state is an illustration rather than the outcome of actual records.
- Keep the existing meal demonstration as a separate mode. Switching to an illustrative stage must not leave fabricated meal history or impact totals attached to it; hide those totals or label them unavailable in that mode.
- Reset returns to a reproducible starting state. A fixed showcase set covers seed, sprout, sapling, young, established, veteran, and stressed/recovering trees.
- Live student views show actual progress and the next milestone; they do not expose controls that change earned growth.
- Keep all prototype controls in Turkish and use familiar wording instead of geometry or rendering terminology.

### School forest

- Use the same tree geometry and materials, with simpler distant details and the same recognizable silhouette.
- Add gently varied terrain, connecting paths, ground cover, and distant vegetation. Preserve existing plot assignments.
- Give selected trees a restrained ground highlight and smoothly center the camera on them.
- Show names on selection and at useful zoom levels; avoid dense labels covering crowns.
- Calculate culling and selection from tree bounds, including tall and wide crowns. Resolve overlapping selection by actual drawing order.
- Keep distant detail reductions gradual. Fine leaves can merge into canopy masses, but branches and crown shape must not jump when zooming.

## Reusable implementation structure

Extend the existing forest modules rather than introduce a parallel feature tree.

| Responsibility | Proposed location |
| --- | --- |
| Stage metadata and continuous visual growth profile | `src/lib/forest/growth-profile.ts` |
| Deterministic branch graph, attachments, and bounds | `src/lib/forest/tree-geometry.ts` |
| Shared palettes, light, material, and motion settings | `src/components/forest/scene-theme.ts` |
| Bark, roots, branches, and foliage drawing | Existing `src/components/forest/tree-painter.ts`, with focused helpers as needed |
| Terrain and stable decoration | `src/components/forest/environment-painter.ts` |
| Camera framing and selection calculations | `src/components/forest/scene-camera.ts` |
| Animation lifecycle, visibility, resize, and quality settings | `src/components/forest/use-world-renderer.ts` |
| Scene composition and accessible controls | Existing `src/components/forest/world.tsx` |
| Demo-only slider, playback, and condition controls | `src/components/forest/growth-preview-controls.tsx` |
| Reproducible preview states | `src/lib/forest/visual-fixtures.ts` |

Keep geometry and growth functions pure and independent of React or canvas. Cache stable branch structure and decorative geometry by seed and generator version. Bound caches and release unused scene resources. Reuse the same `World` in the personal page, demo, and visit dialog; use shared styles and controls across views.

Cache static scenery separately from animated trees. Use screen size to choose detail with hysteresis and blending. Stop work when a scene is hidden or offscreen; reduced motion renders state changes without continuous decorative animation. Preserve the accessible HTML information and fallback when canvas is unavailable.

## Delivery stages and completion checks

### 1. Detailed tree prototype

Build one strong established tree and its ground patch using fixed seed and health. Establish silhouette, branch anatomy, bark, leaf layering, light, and depth before broadening the scene.

Complete when: the trunk, individual branches, leaf groupings, and contact shadows are clear at desktop and mobile sizes; the result reads as a detailed game asset rather than a flat icon. Capture a before/after comparison at the same state and viewport. Measure rendering cost before adding further detail.

### 2. Full continuous life cycle

Extract the shared growth profile and deterministic skeleton. Implement emergence through veteran development, gradual leaf opening, and stable attachment points. Add illustrative stage scrubbing for development and preview use.

Complete when: a slow sweep through every boundary shows no replacement tree, detached branch, sudden palette switch, or sudden scale jump. Identical seeds and state reproduce identical geometry. Very large growth values remain finite and fit the same bounded complexity budget.

### 3. Condition and animation

Add coordinated wind, local growth response, stress, and recovery. Implement interruption handling, camera easing, and reduced motion.

Complete when: a new update during animation remains smooth; repeated identical data does not replay it; stress preserves woody structure; recovery restores recognizable foliage; reduced motion removes looping decorative movement.

### 4. Scene and preview upgrade

Add the detailed environment, cleaner scene framing, accessible timeline controls, condition demonstration, and consistent mobile layout. Connect the upgraded renderer to the personal page and visit dialog.

Complete when: all stages are inspectable in the demo; illustrative controls cannot mutate live data; stage scrubbing has no misleading impact totals; trees fit at narrow and wide viewport sizes without controls covering important details.

### 5. Forest integration and quality pass

Bring the same art into the forest, tune detail levels, improve selection, and validate resource reuse. Review fixed screenshots and animation across several seeds, all stages, and health levels.

Complete when: a tree keeps its identity between preview, personal view, forest, and visit dialog; zoom does not change its silhouette; navigation and selection remain responsive. Target at least 30 FPS during interaction on an agreed representative school phone and 60 FPS on a representative desktop, measuring rather than assuming. Exercise the existing 24-tree preview and a synthetic 1,000-tree forest with viewport culling.

## Verification scope

- Growth continuity around 0, 0.6, 3, 14, 60, and 160, including small increments and very old trees.
- Unique branch IDs, attached children, reproducible geometry, and bounded branch/leaf counts.
- Smooth health blending and interrupted animation; accumulated growth remains unchanged by presentation controls.
- Visual checks across contrasting seeds, all stages, stress/recovery, portrait mobile, desktop, and high pixel density.
- Forest overlap, selection, zoom, camera fit, visibility suspension, reduced motion, keyboard controls, and canvas fallback.
- Existing simulation, showcase, and API tests remain passing. Add focused tests for the new pure geometry/profile contracts and continuity, rather than testing decorative implementation details.

Do not expand this pass into scoring changes, new species, weather systems, or unrelated backend work. Deliver the detailed prototype first, then carry its quality through the continuous growth system and every shared scene.


## Landscape and wildlife follow-up — 2026-10-04

Added a shared world-coordinate landscape model and reusable painters for terrain details, water, and wildlife. The garden and forest now include varied meadow textures, layered distant woods, shaded mossy stones, ferns, flowers, reeds, a fallen log, a winding shallow stream, and a wooden footbridge. Rabbits, squirrels, robins, and ducks have restrained idle or swimming motion. Ducks follow the stream; wildlife is sorted against tree bases for correct overlap. Reduced-motion and offscreen suspension apply to all animation.

Both garden and forest static scenery are cached until framing changes. Fine ground details are omitted at distant zoom levels, and placements remain deterministic across viewport changes. The existing planting coordinates and metre reference are retained.

Validation: 26 tests pass, including four landscape tests covering river/plot separation, stable terrain placement across viewport boundaries, habitat constraints, continuous motion, and offscreen wildlife culling. TypeScript and ESLint pass. Desktop and 390px mobile garden/forest views, pan, and zoom were checked in the browser. No physical-device frame-rate guarantee or production-build result is claimed.
