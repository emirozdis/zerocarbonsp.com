import test from "node:test";
import assert from "node:assert/strict";
import {
  growPlant,
  mealScore,
  summarize,
  seedFor,
} from "../src/lib/forest/model.ts";
const now = Date.parse("2026-10-04T12:00:00Z");
const user = {
  uid: "student-1",
  displayName: "Deniz",
  createdAt: "2026-09-01 12:00:00",
};
const meal = (id, weight = 0) => ({
  id,
  weight,
  co2Emission: weight * 3,
  waterFootprint: weight,
  createdAt: new Date(now + id * 1000).toISOString(),
  baselineWeight: 450,
  baselineCO2: 1800,
  baselineWater: 500,
  targetRatio: 0.15,
});
test("a student starts with a seed, and absence never damages it", () => {
  const first = growPlant(user, [], now).plant,
    later = growPlant(user, [], now + 30 * 86400000).plant;
  assert.equal(first.stage, "Tohum");
  assert.equal(first.height, 0);
  assert.equal(first.growth, 0);
  assert.equal(first.health, later.health);
  assert.equal(later.age - first.age, 30);
});
test("a zero-waste post-meal scan grows the seed", () => {
  const { plant, history } = growPlant(user, [meal(1)], now);
  assert.equal(mealScore(meal(1)), 1);
  assert.ok(plant.height > 0);
  assert.equal(plant.meals, 1);
  assert.equal(plant.savedCO2, 1.8);
  assert.equal(plant.savedWater, 500);
  assert.equal(history[0].id, 1);
});
test("poor outcomes reduce ratio-based size and vitality; recovery works", () => {
  const good = Array.from({ length: 20 }, (_, i) => meal(i));
  const healthy = growPlant(user, good, now).plant;
  const bad = [
    ...good,
    ...Array.from({ length: 15 }, (_, i) => meal(i + 20, 450)),
  ];
  const stressed = growPlant(user, bad, now).plant;
  const recovered = growPlant(
    user,
    [...bad, ...Array.from({ length: 15 }, (_, i) => meal(i + 35))],
    now,
  ).plant;
  assert.ok(stressed.growth < healthy.growth);
  assert.equal(stressed.health, 15);
  assert.ok(recovered.health > stressed.health);
  assert.ok(recovered.height > stressed.height);
});
test("equal waste ratios have equal dimensions regardless of attendance", () => {
  const mature = growPlant(
    user,
    Array.from({ length: 1000 }, (_, i) => meal(i)),
    now,
  ).plant;
  const older = growPlant(
    user,
    Array.from({ length: 10000 }, (_, i) => meal(i)),
    now,
  ).plant;
  assert.equal(older.height, mature.height);
  assert.equal(older.width, mature.width);
  assert.equal(older.trunk, mature.trunk);
  assert.ok(Number.isFinite(older.height));
  assert.equal(older.health, 100);
});
test("replay is deterministic, ordered by event time and stable ID", () => {
  const records = [meal(1), meal(2, 400), meal(3), meal(4, 200)];
  assert.deepEqual(
    growPlant(user, records, now),
    growPlant(user, [...records].reverse(), now),
  );
  assert.equal(seedFor(user.uid), growPlant(user, records, now).plant.seed);
});
test("historical baseline snapshots independently determine outcomes", () => {
  const highBaseline = {
    ...meal(1, 60),
    baselineWeight: 900,
    baselineCO2: 3600,
    baselineWater: 1000,
  };
  assert.ok(mealScore(highBaseline) > mealScore(meal(1, 60)));
});
test("excess footprint remains a signed difference", () => {
  const { plant } = growPlant(user, [meal(1, 1000)], now);
  assert.ok(plant.savedCO2 < 0);
  assert.ok(plant.savedFood < 0);
  assert.ok(plant.savedWater < 0);
});
test("forest summarizes the actual student plants without double penalties", () => {
  const a = growPlant(user, [meal(1)], now).plant;
  const b = growPlant({ ...user, uid: "student-2" }, [meal(1, 450)], now).plant;
  const seed = growPlant({ ...user, uid: "new-student" }, [], now).plant;
  const result = summarize([a, b, seed]);
  assert.equal(result.health, (a.health + b.health) / 2);
  assert.equal(result.growth, a.growth + b.growth);
  assert.equal(result.meals, 2);
});

test("displayed report footprints do not become negative baseline savings", async () => {
  const { createReportStudents, reportTotals } = await import("../src/lib/forest/report-dataset.ts");
  const { dailyMeals } = await import("../src/lib/forest/model.ts");
  const { impactMetrics } = await import("../src/lib/forest/impact.ts");
  const students = createReportStudents({ weight: 450, co2: 1800, water: 500, targetRatio: 0.15 });
  const plants = students.map((student) => growPlant(student, dailyMeals(student.records), now).plant);
  assert.ok(plants[0].savedWater < 0); // Reproduces the originally mislabeled card.
  for (const [index, plant] of plants.entries()) {
    for (const key of ["wasteGrams", "co2Kilograms", "waterLiters"]) {
      assert.ok(Math.abs(plant.impact[key] - reportTotals[index][key]) < 1e-8);
    }
    assert.ok(impactMetrics(plant.impact).every((metric) => metric.value >= 0));
  }
  assert.ok(Math.abs(impactMetrics(plants[0].impact)[2].value - 1.64) < 1e-8);
  const changedBaselines = students[0].records.map((record) => ({ ...record, baselineCO2: 1, baselineWater: 1, baselineWeight: 1 }));
  assert.deepEqual(growPlant(students[0], dailyMeals(changedBaselines), now).plant.impact, plants[0].impact);
  const summary = summarize(plants);
  for (const key of ["wasteGrams", "co2Kilograms", "waterLiters"]) {
    assert.ok(Math.abs(summary.impact[key] - reportTotals.reduce((sum, total) => sum + total[key], 0)) < 1e-8);
  }
  assert.deepEqual(summarize([]).impact, { wasteGrams: 0, co2Kilograms: 0, waterLiters: 0 });
});

test("tree size and leaderboard agree despite meal counts, food categories, or meal order", async () => {
  const { rankStudents } = await import("../src/lib/leaderboard.ts");
  const samples = [
    [meal(1, 9)],
    Array.from({ length: 50 }, (_, i) => ({ ...meal(i, 45), co2Emission: 0, waterFootprint: 0 })),
    [meal(1, 90), meal(2, 0)],
    [],
  ];
  const plants = samples.map((records, i) => growPlant({ ...user, uid: String(i) }, records, now).plant);
  const ranked = rankStudents(samples.map((records, i) => ({
    uid: String(i), displayName: String(i), totalCO2: 0, totalWater: 0,
    mealCount: records.length,
    totalWaste: records.reduce((sum, r) => sum + r.weight, 0),
    totalMealWeight: records.reduce((sum, r) => sum + r.baselineWeight, 0),
  })));
  const heights = ranked.map((s) => plants.find((p) => p.uid === s.uid).height);
  assert.ok(heights[0] > heights[1]);
  assert.equal(heights[1], heights[2]);
  assert.equal(heights[3], 0);
});
