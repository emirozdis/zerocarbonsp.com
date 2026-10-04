# Living Forest implementation plan

Status: first living-forest implementation added on 2026-10-04. The current implementation uses a shared procedural Canvas 2D renderer, rather than adding a Three.js dependency. Advanced teacher tools, corrections, class groves, and cosmetic unlocks remain follow-up work.

Accepted requirement update: every post-meal card scan is one completed meal, including zero waste. Compare each scan with configured constant average meal weight, emissions, and embodied-water baselines. Additional meal attendance verification is not required for this workflow. Historical records use the same assumption; baseline snapshots are persisted during migration and on new records. The earlier attendance prerequisites below are superseded by this decision.

## 1. Product direction

Turn the existing waste leaderboard into a small living world. Each student owns one persistent, procedurally generated tree. Verified environmental actions change its structure and condition. The school forest contains those same trees, positioned on an explorable illustrated landscape.

Use the supplied poster as inspiration for the seed, values, forest, and shared contribution themes. Its numerical claims, hardware illustrations, and donation ideas are reference content, not verified requirements or evidence. Keep the current Turkish language and use names such as “Fidanım”, “Okul Ormanımız”, and “Gelişimim”.

Design principles:

- The tree is the main experience, with readable controls around it.
- Growth changes actual generated geometry, not a sequence of replacement pictures.
- Progress never reaches a final level; rendering complexity remains bounded.
- Poor verified outcomes have visible, recoverable consequences.
- School success is cooperative. Individual setbacks are explained privately.
- One simulation and one tree generator power every presentation.

## 2. Current project and prerequisites

The repository uses Next.js 15, React 19, TypeScript, Tailwind, Radix components, Recharts, and SQLite. The home page ranks students by cumulative estimated food-waste CO2. API routes store students and waste records and calculate estimated CO2 and embodied water from food category and grams.

Missing foundations:

- Student sessions, roles, school/class membership, and school-scoped access.
- Confirmed meal participation and completed meal sessions, including verified zero-waste meals.
- Direct water-use measurements or teacher-verified water actions.
- Device event identity, retry deduplication, and corrections.
- A shared database layer and migrations; current routes repeat table setup and connection logic.
- Atomic record/aggregate updates; current writes are separate operations.

No record must mean “unknown”, not “perfect behavior”. Food-derived water footprint must remain labeled as an estimate and separate from measured tap-water savings. Existing cumulative totals cannot establish fair savings or historical plant rewards by themselves.

## 3. Student journeys and pages

### `/my-plant` — Fidanım

First visit: discover a seed in a small soil clearing, name the tree, and see one simple explanation of how it grows. Species can be assigned from a persistent seed or chosen from equally balanced options.

Returning visit: the tree fills most of the screen. A short animation shows verified changes since the student's last visit. Below it, display height, canopy width, age, and vitality, with a plain-language explanation of the last change.

Primary controls: “Bugünkü katkım”, “Gelişimim”, and “Ormana git”. The daily contribution view explains records already received; opening the page or pressing a button does not award environmental progress. A small timeline shows meaningful moments, such as the first branch or recovery after a difficult day.

### `/forest` — Okul Ormanımız

An orthographic, isometric school landscape with gentle terrain, paths, class groves, a central gathering place, and individually selectable trees. This is a fictional school map, not students' geographical locations.

Support pan, zoom, class filters, nickname search, and “Ağacımı bul”. Selecting a tree opens a compact card; visiting it uses the same close-up scene as the owner's page. Public cards show nickname, age, milestones, and encouraging reactions. Exact waste records and explanations of setbacks remain private.

Zoom levels: school overview → class grove → individual tree. Keep plots stable between visits. Expand the landscape in chunks when new students join. Large trees use a compressed map scale and generous plot spacing; their detail view shows their full virtual measurements.

### `/progress` — Gelişimim

Personal trends, verified contributions, tree history, and explanations of estimated impact. Compare equivalent attended meals and personal improvement, not raw lifetime totals. Reuse the existing chart primitives.

### `/school` — Birlikte Başardık

Shared goals, recent collective achievements, participation coverage, and aggregate trends. Cooperative milestones can add a butterfly habitat, flowers, benches, or a pond to the map. These are virtual rewards unless a separately verified real-world activity exists.

### `/teacher` — school tools

Manage students and class membership; review exceptional readings; approve supported actions; manage school calendars and meal baselines; inspect device coverage; and correct records with an audit trail. Teachers cannot silently manufacture historical “savings”.

Use four student navigation items on mobile: Fidanım, Ormanımız, Gelişimim, Okulum. Place friend discovery within the forest, avoiding another disconnected screen. Retain the existing informational page. Move the legacy leaderboard to an explicit route during transition; introduce the new home experience behind a feature flag.

## 4. Art and interaction direction

Aim for a tactile miniature garden: warm cream surfaces, deep green text, mint and sky-blue accents, soft clay-like trees, rounded panels, subtle shadows, and spacious typography. Use the poster's environmental themes without reproducing its dense information layout.

Trees have slightly irregular trunks, recognizable branch silhouettes, clustered foliage, and gentle wind movement. The seed visibly opens; roots and a shoot emerge; branches extend from existing endpoints. New leaves unfurl locally instead of the whole model popping into another shape.

Use short growth celebrations, small leaf particles, and optional muted-by-default sound. Under stress, leaves droop and thin before recovering. Day/night appearance follows the student's local time as decoration; it does not alter scoring. Seasonal decoration must be visually distinct from stress so autumn leaves do not imply misconduct.

Mobile uses a full-width scene with a bottom information sheet. Desktop uses a larger scene with a compact side panel. Essential controls and labels remain HTML, with keyboard access, touch targets, text equivalents, reduced motion, a list alternative to the map, and a lightweight fallback when WebGL is unavailable.

## 5. Persistent plant simulation

Separate four concerns: verified inputs, reward rules, plant state, and visual generation.

Each plant stores:

| State | Meaning |
| --- | --- |
| `seed`, `species`, `generatorVersion` | Stable identity and reproducible visual rules |
| `plantedAt`, `activeDays` | Calendar age and days with qualifying participation |
| `growthCredits`, `biomass` | Persistent earned development; no terminal level |
| `height`, `trunkRadius`, `canopyRadius` | Virtual dimensions derived from development |
| `vitality`, `stress`, `leafDensity` | Bounded condition that can deteriorate and recover |
| `structureRevision`, `branchDescriptors` | Stable topology and newly unlocked growth |
| `lastProcessedEvent`, `rulesVersion`, `revision` | Replay, audit, and concurrency control |

Use a deterministic branching algorithm with stable branch IDs. A persistent random seed determines branch angles, asymmetry, crown character, and leaf variation. Existing branches keep their identity as new segments appear. Recompute derived geometry from the saved descriptors and seed; do not store every rendered vertex.

Maintain unbounded logical progression with diminishing visual growth, for example `height = baseHeight + heightScale × log(1 + biomass / biomassScale)`, with species-specific parameters and a separate germination model. Width and trunk thickness have their own curves. Mature trees continue adding branch development, crown volume, trunk girth, growth rings, and milestones rather than becoming uniformly stretched seedlings.

“Infinite” means no designed final stage, not infinitely many polygons or a biologically literal tree. Generate only the visible detail needed at the current camera distance. Older fine branches can be represented by coarser geometry; preserve their logical descriptors or deterministic reconstruction rules. Long-term art direction should keep mature proportions attractive.

Health is not age or earned progress. A setback lowers vitality, slows near-term development, and causes recoverable foliage loss. It does not erase lifetime age, earned milestones, or the whole trunk. Recovery restores foliage before resuming full growth. No automatic harm for holidays, absence, device outages, or simply not opening the app.

## 6. Verified behavior and balancing

Evaluate completed meal sessions, not every bin deposit. Otherwise splitting one meal's waste into several events could multiply rewards or penalties.

Create a frozen reference expectation for comparable meals using school-approved menu, serving, and participation information. Score both low waste and improvement; improvement alone would disadvantage students who already waste little. If required context or reliable coverage is missing, mark the session unscored until resolved. Avoid rewarding smaller food consumption or penalizing dietary accommodations and unavoidable waste.

Illustrative pilot rules, to be tuned with school feedback:

| Outcome | Plant effect |
| --- | --- |
| Confirmed low-waste or zero-waste completed meal | Growth credits, improved vitality, visible new growth |
| Confirmed improvement over a comparable baseline | Proportional growth credit |
| Verified direct water-saving action | Capped additional credit, recorded in a separate measurement stream |
| Confirmed avoidable waste above the agreed range | Capped stress and temporary foliage loss |
| Missing data, holidays, absence, sensor uncertainty | No behavioral reward or penalty |
| Correction of an invalid reading | Recalculate affected state and show the corrected explanation |

Use one normalized outcome per session with explicit precedence, rather than stacking overlapping rewards for the same evidence. Publish versioned rules; bound rewards and stress per session/day. Repeated poor outcomes can visibly weaken a tree, but recovery remains achievable. Support teacher exemptions and a minimum vitality floor; avoid permanent death or public blame.

Example interaction: a verified improved meal extends a small branch and opens new leaves. A later high-waste meal causes some leaves to droop, with a private message explaining why and how the tree can recover. A subsequent qualifying meal restores vitality and foliage. These are game responses, not claims about real-world tree growth.

Estimated avoided CO2 and embodied water require a documented comparable baseline and versioned factors. Report signed differences internally; show savings only where the difference is positive. Never describe the virtual forest as real planted trees or verified carbon sequestration.

## 7. Forest simulation

The forest is the composition of actual student plants, plus a school-level environment model. Do not maintain a second independently growing copy of each tree.

- Physical appearance: aggregate canopy, dimensions, and foliage from individual plant states.
- Current school trend: calculate a rolling, participation-normalized outcome from valid sessions, with data-coverage indicators.
- Shared environment: healthier collective outcomes gradually add ground cover, flowers, insects, and livelier surroundings; sustained negative outcomes gently thin these effects.
- Persistent achievements: unlocked paths, landmarks, and historical school milestones remain.

Apply the same concepts—accumulated growth, current vitality, capped stress, recovery—to the school environment, through shared pure rule helpers with separate configuration. Do not apply the school penalty to students' plants a second time. Smooth environment changes over a proposed seven-school-day window so one record cannot abruptly darken the forest.

Weight recent contributions by eligible participation, not school enrollment alone. Show low confidence during outages or incomplete collection. Freeze behavioral changes when evidence is insufficient. Separate total forest size from recent school performance so older or larger schools are not automatically considered “better”.

School transfers preserve plant identity and personal history while moving its plot. Attribute behavior to the school membership at the time of the event. New students start with a seed in a welcoming plot, not a low rank.

## 8. Reusable architecture

Keep the existing Next.js app. Proposed rendering stack: Three.js through React Three Fiber, with compatible dependency versions checked during implementation. Load the scene only on routes that need it.

```text
src/domain/impact/          Units, factors, baseline comparison
src/domain/gamification/    Versioned outcome rules and event reduction
src/domain/plants/          Plant state, species, growth curves
src/domain/forest/          School aggregates and stable plot allocation
src/server/db/              Shared connection, migrations, repositories
src/server/auth/            Sessions, roles, school access
src/server/services/        Ingestion, corrections, plant/forest projections
src/components/world/      Shared tree generator, scenes, camera, selection
src/components/gamification/ Stats, timeline, milestones, outcome feedback
src/components/ui/          Existing shared interface primitives
```

Keep domain logic independent of React, the database, and Three.js. One `TreeModel` definition powers close-up scenes, forest trees, and previews. It accepts state, detail level, and animation progress; pages do not reproduce growth math. Use shared scene controls, typography, colors, spacing, and motion tokens.

Extend data with `schools`, `classes`, time-bound `memberships`, `meal_sessions`, `behavior_events`, `plants`, `plant_snapshots`, `forest_plots`, `school_snapshots`, and versioned baseline/rule configuration. Keep raw waste measurements linked to their source events. Measurements need explicit units, timestamps, device IDs, school identity, unique event IDs, verification status, and correction references.

Processing sequence: authenticate device → validate and deduplicate source event → store raw measurement → finalize or revise meal outcome → apply versioned plant rules → update plant and school projections → return updated revision. Use transactions for related writes and serialize conflicting updates. An append-only correction event invalidates affected projections; replay ordered events from an appropriate snapshot under their historical rule versions. Do not silently rescore history when rules change.

For the initial single-server pilot, SQLite is viable as a deployment assumption with durable storage, migrations, backups, foreign keys, transactional updates, and appropriate concurrency handling. Move to PostgreSQL before a deployment that needs multiple independent application writers. Do not treat a database migration as a substitute for correct transactions or access control.

API responsibilities: authenticated personal plant/history, school-scoped forest summaries and paginated map regions, permitted tree profiles, and teacher correction endpoints. Keep legacy device ingestion compatible via an adapter; enhanced firmware adds event IDs and meal-session completion. Legacy events without trustworthy session context are retained but do not earn invented zero-waste credit.

Replace the built-in fallback device secret with required configured credentials. Scope device access to its school; do not expose device keys to browsers. Current public record endpoints must be tightened before introducing private student data. Use opaque profile identifiers and nicknames in social views; never expose card IDs or another student's detailed history.

For initial live feedback, use modest polling while a page is active plus revalidation after a verified action. Add server-sent events only if the pilot requires faster passive updates. Rendering animations do not mutate authoritative plant state.

## 9. Performance and quality

Use shared geometry/materials and instanced leaves and compatible tree parts. Different tree shapes still require geometry bucketing or generated buffers; instancing alone will not make thousands of unique detailed trees inexpensive. Render close-up branches in high detail and far-away trees as simplified forms. Cull off-screen regions and pause decorative motion when hidden or reduced motion is enabled.

React Three Fiber supports demand rendering and documents resource reuse/instancing. Three.js provides `InstancedMesh` for repeated geometry/materials. These support this architecture; they do not guarantee a frame rate without measuring the actual scenes.

Proposed pilot targets: 30 FPS on an agreed low-end school device during forest navigation; 60 FPS as a desktop target; a 1,000-student synthetic school fixture with only the visible map region rendered; usable HTML controls while scene assets load. Test a much older virtual tree as well as seedlings to catch unbounded geometry growth. Revise budgets after the visual prototype.

Required verification:

- Identical seed/state generates identical structure after refresh.
- Growth extends existing branches and never resets at the last named stage.
- Health damage and recovery visibly match rule outcomes.
- Duplicate or out-of-order device events, corrections, and concurrent updates produce consistent totals and projections.
- Unknown attendance, holidays, outages, and dietary exemptions do not create false penalties.
- Student/school access is enforced server-side; friend profiles omit private readings.
- One plant looks consistent in its own scene and the forest.
- Mobile touch, keyboard navigation, reduced motion, and WebGL fallback work.

## 10. Delivery sequence and exit criteria

1. **Data contract and visual prototype.** Define meal verification, water evidence, baseline policy, and privacy defaults. Create the reusable tree generator and one small interactive forest with synthetic data. Exit: demonstrate seed emergence, intermediate growth, a mature evolving tree, stress, recovery, and acceptable mobile rendering. Synthetic states are explicitly labeled.
2. **Trusted foundation.** Add shared database access, migrations, school membership, student/teacher sessions, device scoping, deduplication, and session outcomes. Exit: replayable sample meals and corrections with no duplicate credit or cross-school access.
3. **Personal plant vertical slice.** Connect one real verified meal through rules and persistence to `/my-plant`; add explanations, history, and recovery. Exit: reload preserves the tree and a real action visibly changes it exactly once.
4. **School forest.** Add stable plots, camera controls, class groves, tree visits, nickname search, and the shared environment. Exit: all participating students appear with consistent state, and the large-school test remains usable.
5. **Progress and cooperative goals.** Add teacher review, personal charts, group milestones, accessibility polish, and Turkish copy. Exit: staff can explain and correct outcomes; the student loop works without technical guidance.
6. **Pilot and tuning.** Run with one class, inspect data coverage and unfair outcomes, tune versioned rules prospectively, and widen rollout through a feature flag. Exit: reliable capture, understandable feedback, stable devices, and school agreement on the scoring model.

Deliver the visual prototype first because procedural growth quality and school-device performance are the biggest uncertainties. Do not begin with a full forest built from static stage images and plan to replace it later.

First release includes one well-developed species, continuous structural growth, recoverable health, school forest visits, basic history, and teacher correction tools. Add more species, seasonal art, safe preset reactions, richer group quests, and cosmetic decorations after the core loop is proven. Defer trading, open chat, public cross-school rankings, real-world mapping, and elaborate weather simulation.

## 11. Decisions to settle before production scoring

- How the hardware or school process confirms attendance, meal completion, and genuine zero waste.
- Whether direct water measurement exists; otherwise launch with clearly labeled embodied-water estimates only.
- How comparable meal/serving baselines and unavoidable waste are recorded.
- Student sign-in method, age range, and school-approved social visibility.
- Expected students per school, target devices, and hosting topology.

These do not block a synthetic visual prototype. They do block honest production rewards based on data the system cannot currently observe.

## Technical references

- [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [React Three Fiber Canvas configuration](https://r3f.docs.pmnd.rs/api/canvas)
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)
