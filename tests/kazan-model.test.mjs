import test from "node:test";
import assert from "node:assert/strict";
import { kazanProgress } from "../src/lib/kazan/model.ts";

test("school progress handles empty, intermediate, exact and exceeded goals", () => {
  assert.equal(kazanProgress(0, 500).fill, 0);
  const partial = kazanProgress(342, 500);
  assert.equal(partial.percent, 68);
  assert.equal(partial.remainingKg, 158);
  assert.equal(partial.nextMilestone.percent, 75);
  assert.equal(kazanProgress(375, 500).nextMilestone.percent, 100);
  assert.equal(kazanProgress(500, 500).completed, true);
  assert.equal(kazanProgress(500, 500).nextMilestone, null);
  const exceeded = kazanProgress(620, 500);
  assert.equal(exceeded.fill, 1);
  assert.equal(exceeded.totalKg, 620);
  assert.equal(exceeded.remainingKg, 0);
});

test("excess waste keeps its signed value without negative visual fill", () => {
  const result = kazanProgress(-20, 500);
  assert.equal(result.totalKg, -20);
  assert.equal(result.fill, 0);
  assert.equal(result.remainingKg, 520);
  assert.equal(result.completed, false);
});

test("invalid inputs cannot produce invalid progress or false completion", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.equal(kazanProgress(value, 500).fill, 0);
    assert.equal(kazanProgress(value, 500).completed, false);
  }
  for (const target of [0, -1, NaN, Infinity])
    assert.throws(() => kazanProgress(1, target), RangeError);
});
