import test from "node:test";
import assert from "node:assert/strict";
import { rankStudents } from "../src/lib/leaderboard.ts";
const student = (uid, totalWaste, totalMealWeight, mealCount) => ({
  uid, displayName: `Öğrenci ${uid}`, totalCO2: totalWaste * 3,
  totalWater: totalWaste, totalWaste, totalMealWeight, mealCount,
});
test("lower waste ratio beats lower lifetime totals despite more recorded meals", () => {
  const results = rankStudents([
    student("few", 45, 450, 1),
    student("many", 225, 4500, 10),
  ]);
  assert.deepEqual(results.map((s) => s.uid), ["many", "few"]);
  assert.equal(results[0].wasteRatio, 0.05);
  assert.equal(results[0].totalWaste, 225);
  assert.equal(results[0].co2Emissions, 0.675);
});
test("equal ratios use a stable tie-break without rewarding attendance or totals", () => {
  const users = [student("b", 20, 200, 1), student("a", 100, 1000, 5)];
  assert.deepEqual(rankStudents(users).map((s) => s.uid), ["a", "b"]);
  assert.equal(users[0].uid, "b");
});
test("zero waste meals qualify while missing meals or baselines remain unranked", () => {
  const results = rankStudents([
    student("empty", 0, 0, 0), student("zero", 0, 450, 1),
    student("missing", 5, 0, 1), student("excess", 600, 450, 1),
  ]);
  assert.deepEqual(results.map((s) => s.uid), ["zero", "excess", "empty", "missing"]);
  assert.equal(results[0].wasteRatio, 0);
  assert.ok(results[1].wasteRatio > 1);
  assert.equal(results[2].wasteRatio, null);
  assert.equal(results[3].wasteRatio, null);
});
