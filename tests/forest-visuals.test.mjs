import test from "node:test";
import assert from "node:assert/strict";
import { createTreeGeometry, curvePoint } from "../src/lib/forest/tree-geometry.ts";
import { growthStage, plantDimensions, timelineGrowth, growthPosition, GROWTH_STAGES } from "../src/lib/forest/growth-profile.ts";
import { retargetTransition, sampleTransition } from "../src/lib/forest/visual-transition.ts";
import { growPlant } from "../src/lib/forest/model.ts";
const seed = 8192;

test("tree identity is reproducible with unique attached branches and a fixed complexity budget", () => {
  const tree = createTreeGeometry(seed, 100);
  assert.deepEqual(tree, createTreeGeometry(seed, 100));
  assert.notDeepEqual(tree, createTreeGeometry(seed + 1, 100));
  assert.equal(new Set(tree.branches.map(b => b.id)).size, tree.branches.length);
  assert.equal(new Set(tree.crowns.map(b => b.id)).size, tree.crowns.length);
  const parents = new Map(tree.branches.map(b => [b.id, b]));
  for (const branch of tree.branches.filter(b => b.parent)) {
    const parent = parents.get(branch.parent);
    assert.ok(parent, `Missing parent: ${branch.id}`);
    const expected = curvePoint(parent, branch.attach);
    assert.ok(Math.abs(branch.start.x - expected.x) < 1e-10);
    assert.ok(Math.abs(branch.start.y - expected.y) < 1e-10);
    assert.ok(branch.progress <= parent.progress);
  }
  assert.equal(createTreeGeometry(seed, 1e12).branches.length, tree.branches.length);
  assert.equal(createTreeGeometry(seed, 1e12).crowns.length, tree.crowns.length);
});

test("geometry and dimensions are continuous at emergence and every milestone", () => {
  for (const growth of [0, ...GROWTH_STAGES.map(s => s.at), 2.5, 8, 12, 80]) {
    const before = createTreeGeometry(seed, Math.max(0, growth - 1e-6));
    const after = createTreeGeometry(seed, growth + 1e-6);
    assert.deepEqual(before.branches.map(b => b.id), after.branches.map(b => b.id));
    for (let i = 0; i < after.branches.length; i++) {
      const a = before.branches[i], b = after.branches[i];
      assert.ok(Math.hypot(a.end.x - b.end.x, a.end.y - b.end.y) < 1e-4, `Jump at ${growth}: ${b.id}`);
      assert.ok(Math.abs(a.width - b.width) < 1e-4);
    }
    for (let i = 0; i < after.crowns.length; i++) assert.ok(Math.abs(before.crowns[i].radius - after.crowns[i].radius) < 1e-4);
    for (const dimension of ["height", "width", "trunk"]) assert.ok(Math.abs(before.profile[dimension] - after.profile[dimension]) < 1e-4);
  }
});

test("late growth remains finite and continues beyond the last stage", () => {
  const adult = plantDimensions(160), old = plantDimensions(10000);
  for (const key of ["height", "width", "trunk"]) assert.ok(old[key] > adult[key]);
  const ancient = createTreeGeometry(seed, 1e12);
  for (const branch of ancient.branches) {
    for (const point of [branch.start, branch.control, branch.end]) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
  }
  assert.ok(Object.values(ancient.bounds).every(Number.isFinite));
  assert.equal(growthStage(0).label, "Tohum");
  assert.equal(growthStage(0.00001).label, "Çimlenme");
  assert.equal(growthStage(3).label, "Fidan");
  assert.equal(growthStage(160).label, "Köklü ağaç");
});

test("preview timeline preserves fine control of early growth", () => {
  for (const value of [0, 0.01, 0.35, 0.6, 3, 14, 60, 160, 320]) assert.ok(Math.abs(timelineGrowth(growthPosition(value)) - value) < 1e-9);
  assert.equal(timelineGrowth(-1), 0);
  assert.ok(Math.abs(timelineGrowth(2) - 320) < 1e-9);
});

const base = growPlant({ uid: "visual-test", displayName: "Test", createdAt: "2026-10-04T00:00:00Z" }, [], Date.parse("2026-10-04T12:00:00Z")).plant;
test("interrupted growth starts at the displayed state and identical polls do not restart", () => {
  const start = retargetTransition(undefined, { ...base, growth: 10 }, 0);
  const growing = retargetTransition(start, { ...base, growth: 20 }, 100);
  const mid = sampleTransition(growing, 900);
  const next = retargetTransition(growing, { ...base, growth: 21 }, 900);
  assert.equal(next.from.growth, mid.growth);
  assert.equal(sampleTransition(next, 900).growth, mid.growth);
  const poll = retargetTransition(next, { ...base, growth: 21 }, 1100);
  assert.equal(poll.start, 900);
  assert.equal(sampleTransition(poll, 1100).growth, sampleTransition(next, 1100).growth);
});
test("health recovery preserves growth, and direct scrubbing reaches the chosen state", () => {
  const stressed = retargetTransition(undefined, { ...base, growth: 100, health: 30 }, 0);
  const recovering = retargetTransition(stressed, { ...base, growth: 100, health: 100 }, 100);
  const mid = sampleTransition(recovering, 700);
  assert.equal(mid.growth, 100);
  assert.ok(mid.health > 30 && mid.health < 100);
  const scrub = retargetTransition(recovering, { ...base, growth: 0, health: 100 }, 700, true);
  assert.equal(sampleTransition(scrub, 700).growth, 0);
  assert.equal(sampleTransition(scrub, 700).height, 0);
});
