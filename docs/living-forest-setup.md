# Living forest setup

The application now opens a personal garden, with school forest, progress, and school-goal pages. Signed-out visitors see a clearly labeled synthetic preview; preview actions never write records. Students sign in using their registered card number. Trees are generated procedurally on Canvas, with stable branch identities, animated growth and foliage, continuous virtual dimensions, and recoverable health. The same painter renders the personal tree and the forest.

## Configuration

Create `.env.local` with your own values. These are illustrative initial averages, not researched environmental claims:

```dotenv
API_KEYS=replace-with-a-long-random-device-secret
SCHOOL_NAME=Your school name
MEAL_WEIGHT_GRAMS=450
MEAL_CO2_GRAMS=1800
MEAL_WATER_LITERS=500
MEAL_WASTE_TARGET_RATIO=0.15
# Optional; defaults to ./database.sqlite
DATABASE_PATH=./database.sqlite
```

`API_KEYS` accepts comma-separated trusted integration/admin keys. There is no fallback secret. Existing devices must use a configured key. These keys can enroll students, read integration data, submit records, and delete students; they are not browser credentials. Use HTTPS in production. Card numbers act as sign-in credentials in this school-card workflow; avoid exposing them or leaving shared devices signed in.

Defaults are loaded server-side. Changing them affects future records only. On the first request, a transactional migration adds school membership, fixed plot assignments, sessions, and baseline snapshots to the existing SQLite database. Existing students enter the default school, and existing records are interpreted as completed meal scans under the currently configured baseline. Back up an existing database before rollout; verify the initial baseline before its first migration. The default school's name is set at first creation.

SQLite requires a persistent disk and a single deployment with access to that disk. Do not deploy this setup onto an ephemeral filesystem. Baselines use grams of food, grams of CO2, and liters of embodied water. The food-category factors remain those already used by the project.

## Enrollment and scans

`POST /api/users`, with `x-api-key`, accepts:

```json
{
  "cardID": "student-card-number",
  "displayName": "Deniz",
  "schoolId": "school-a",
  "schoolName": "Yeşil Vadi Okulu"
}
```

Omit school fields to enroll into the default school. For a new school ID, supply its display name. Schools have separate student lists and forests. Existing students' identity and records are retained. Plot allocation is stable; new students do not rearrange existing trees.

`POST /api/records`, with `x-api-key`, accepts the existing payload plus an optional unique event ID:

```json
{
  "cardUID": "student-card-number",
  "type": 0,
  "weight": 0,
  "eventId": "device-01-unique-meal-scan-id"
}
```

Each record is one completed meal, as requested. `type` remains 0 = produce, 1 = dairy, 2 = meat. A zero-waste meal must still submit a record with `weight: 0`. Send one aggregate reading per meal scan, not a separate rewarded record for every category deposit. The existing single-category record contract remains; a mixed-category meal batch is not implemented.

Generate `eventId` on the device when a meal is recorded and reuse it on retries. Duplicate IDs with the same payload return the original result without another reward. Reusing an ID with different data returns 409. IDs must be unique across devices. Legacy payloads without IDs still work, but cannot safely deduplicate transport retries.

Writes update the record and cumulative totals in one transaction. Plant states are deterministically projected from persisted records, using each record's saved baseline. There is no browser-authoritative growth or reward endpoint.

## Scoring and growth

The outcome compares food, carbon, and embodied-water waste ratios against their fixed meal baselines and averages those ratios. The configured waste target (default 15%) separates positive from negative outcomes. Reward/stress is bounded per scan. A zero-waste scan receives the strongest positive result; outcomes above the target lower vitality. Students without recorded meals remain seeds.

Tree size uses the same overall food-waste ratio as the leaderboard: total waste weight divided by the sum of the recorded meal baseline weights. Growth units are 60 / (1 + ratio / 0.05)², so a lower ratio always gives a larger tree, regardless of attendance or food category. Zero waste gives 60 units; 5% waste gives 15. Size can decrease when the overall ratio worsens and recover when it improves. Recent meal outcomes independently affect vitality. Vitality stays between 15 and 100. Absence and elapsed time do not damage plants. Age is elapsed calendar days since registration. Virtual height, width, and trunk dimensions use logarithmic curves; live trees reach their largest size at zero waste. Trees are virtual rewards, not carbon offsets or real trees planted.

The school combines the same student states; no extra collective penalty is applied to individual plants. Current implementation uses average vitality of students with records for school health. School goals use accumulated growth; their milestone cards unlock automatically. Scene butterflies vary with vitality. More elaborate habitat rewards and rolling school trends are follow-up features.

Savings are estimated differences from the whole fixed meal baseline. Signed differences are retained; progress pages show negative differences for excess impact, while celebratory home cards floor savings at zero. Embodied water is clearly labeled and is not direct tap-water consumption.

## Access and compatibility

- `/`, `/my-plant`: personal garden and private meal timeline; `/forest`: school map, visits, and shared goals; `/leaderboard`: original lowest-emissions ranking.
- Legacy `/progress` redirects to `/my-plant#growth`; `/school` redirects to `/forest`. The informational `/about` remains available.
- `POST /api/session`: card sign-in, same-origin required; session cookie is HTTP-only, same-site strict, secure in production, expires after seven days.
- `DELETE /api/session`: sign out and revoke the server-side token.
- `GET /api/forest`: requires a session and returns that student's school only. Peers receive first-name display and tree state, not raw meal histories or card IDs.
- `GET /api/users`: now requires a configured integration key, including card lookup. Update old device lookups that previously omitted the header.
- `GET /api/records`: now requires a session or integration key. Students may read their own detailed records only; school-scoped aggregate lists remain available to signed-in students. Integration keys retain administrative access.

The forest supports drag navigation, zoom buttons, a find-my-tree action, search, and accessible HTML tree-selection cards. Reduced-motion settings disable wind motion and growth transitions. Canvas-unavailable devices retain statistics and the tree list.

## Verification

Use Node 24 to run the test harness:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Tests cover seeds, positive scans, persistent growth, damage/recovery, very mature plants, deterministic replay, saved baselines, signed differences, school aggregation, populated legacy migrations, session revocation, school isolation, concurrent duplicate scans, and invalid requests. API tests use a temporary database and invoke route handlers directly without starting a server.

After the build, visually check desktop and mobile views with `npm run dev`. In the signed-out preview, try “İsrafsız öğün” and “İsraflı öğün”, visit another tree, search, and navigate the map. Then enroll two test students in different schools and verify the real card flow. No demo data is inserted into SQLite.

The first implementation does not yet include teacher review/corrections, class management, species selection, direct water hardware, or social messaging. Plant projection currently replays school records on refresh; large deployments should add versioned projection snapshots and paginated map/list loading after measuring their data volume.
