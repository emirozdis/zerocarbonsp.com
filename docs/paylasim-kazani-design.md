# Paylaşım Kazanı

One school, one shared cauldron. No personal cauldrons, contribution ranking, or student names.

## Experience

- `/paylasim-kazani`, linked from the shared navigation.
- Full-width school sharing garden, matching the immersive forest and plant pages. Warm courtyard paving, a distant school building, a vine-covered pergola, vegetable beds, crates, bunting, flowers, drifting butterflies and afternoon light surround a large dimensional SVG cauldron. Translucent progress and goal cards float over the scene. Its cutaway reveals fruit and vegetables rising with the school's progress; food is symbolic, not a claim about donated produce.
- School-wide food savings and a proposed 500 kg goal; the reward is a sapling planting event. Goal configuration is separate from display components.
- Compact progress card floats at the upper right, above the event goal card. Percentage and saved kilograms provide the only scene status labels. A completed goal updates the event action. Date and location remain pending a school announcement.
- Goal details and contribution instructions use existing accessible dialogs. The page ends at the school stats separator; journey stages, the lower preview slider, promotional captions and the engraved kazan label are omitted.
- Responsive scene composition, compact floating cards on phones, keyboard controls, labeled progress and reduced motion support. Decorative scenery lives in a reusable Courtyard component, separate from savings data and the Cauldron illustration.

## Data and boundaries

Reuse ForestProvider and the school-scoped `/api/forest` summary; never sum the privacy-filtered peer plants for savings. Signed savings remain visible, while visual fill is clamped to 0–100%. No new contribution endpoint, database, timers, invented recent activity or duplicated authentication.

Signed-out demo uses the existing synthetic school data, identified in the progress card. Existing automatic refresh updates the authenticated school total. Network failures show retry and stale-data messaging.

The goal is a proposed design configuration. Campaign approval, campaign start/end dates, persistent completion, event scheduling, and administrative editing require a later school campaign workflow. This page does not claim to schedule a real event or permanently award one.
