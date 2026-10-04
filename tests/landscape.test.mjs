import test from "node:test";
import assert from "node:assert/strict";
import { clearGround, onWater, riverAt, terrainSamples, wildlifeFrame } from "../src/lib/forest/landscape-model.ts";
import { randomFor } from "../src/lib/forest/model.ts";

const bounds = { left: -900, right: 900, top: -250, bottom: 450 };
test("the forest stream stays clear of existing planting positions", () => {
  for (let plot = 0; plot < 1000; plot++) {
    for (let seed = 0; seed < 20; seed++) {
      const x = ((plot % 8) - 3.5) * 150 + randomFor(seed, 811) * 35;
      const y = Math.floor(plot / 8) * 145 - 110 + randomFor(seed, 812) * 30;
      assert.equal(onWater(x, y, "forest", 8), false, `Plot ${plot} overlaps the river`);
    }
  }
});
test("terrain sampling is reproducible and neighboring viewports share identical placements", () => {
  for (const kind of ["garden", "forest"]) {
    const points = terrainSamples(bounds, kind);
    assert.deepEqual(points, terrainSamples(bounds, kind));
    assert.ok(points.length < 900, "Keep detail work bounded to visible tiles");
    const moved = terrainSamples({ ...bounds, left: -250, right: 1400 }, kind);
    const shared = new Map(moved.map(p => [p.id, p]));
    for (const point of points.filter(p => p.x > -200 && p.x < 850)) assert.deepEqual(shared.get(point.id), point);
    for (const point of points) {
      assert.equal(onWater(point.x, point.y, kind, point.size + 7), false);
      assert.equal(clearGround(point.x, point.y, kind, point.size), true);
    }
  }
});
test("ducks follow the stream while land animals stay on dry ground", () => {
  for (const kind of ["garden", "forest"]) {
    for (const time of [0, 0.01, 7, 20, 40, 100, 300]) {
      const animals = wildlifeFrame(kind, time, bounds);
      assert.ok(animals.length <= 7);
      assert.equal(new Set(animals.map(a => a.id)).size, animals.length);
      for (const animal of animals) {
        assert.equal(onWater(animal.x, animal.y, kind), animal.kind === "duck");
        assert.ok([animal.x, animal.y, animal.scale, animal.phase].every(Number.isFinite));
      }
      assert.deepEqual(animals.map(a => a.y), [...animals].map(a => a.y).sort((a, b) => a - b));
    }
  }
});
test("river and animal motion stay continuous and cull outside the viewport", () => {
  for (const kind of ["garden", "forest"]) {
    for (let x = -1200; x <= 1200; x += 10) {
      assert.ok(Math.abs(riverAt(x, kind).y - riverAt(x + 0.001, kind).y) < 0.001);
      assert.ok(riverAt(x, kind).halfWidth > 10);
    }
    const before = wildlifeFrame(kind, 12, bounds), after = wildlifeFrame(kind, 12.001, bounds);
    for (const a of before) {
      const b = after.find(b => b.id === a.id);
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 0.01);
    }
    assert.deepEqual(wildlifeFrame(kind, 0, { left: 5000, right: 6000, top: 5000, bottom: 6000 }), []);
  }
});
