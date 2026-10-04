import { randomFor, seedFor } from "./model.ts";

export type LandscapeKind = "garden" | "forest";
export interface TerrainBounds { left: number; top: number; right: number; bottom: number }
export type AnimalKind = "rabbit" | "squirrel" | "robin" | "duck";
export interface Animal {
  id: number;
  kind: AnimalKind;
  x: number;
  y: number;
  scale: number;
  facing: number;
  phase: number;
}

/** All terrain is addressed in world coordinates, including moving water and wildlife. */
export function riverAt(x: number, kind: LandscapeKind) {
  const phase = (x + 80) / (kind === "garden" ? 215 : 260);
  return {
    y: kind === "garden"
      ? -75 + Math.sin(phase) * 26 + Math.sin(x / 105) * 8
      : 110 + Math.sin(phase) * 11,
    halfWidth: (kind === "garden" ? 15 : 18) + Math.sin(x / 173 + 0.8) * 2.5 + Math.sin(x / 27) * 0.8,
    slope: kind === "garden"
      ? Math.cos(phase) * 26 / 215 + Math.cos(x / 105) * 8 / 105
      : Math.cos(phase) * 11 / 260,
  };
}
export function pathAt(x: number, kind: LandscapeKind) {
  return kind === "garden" ? 66 + Math.sin((x - 60) / 220) * 19 : -27 + Math.sin(x / 280) * 8;
}
export function onWater(x: number, y: number, kind: LandscapeKind, margin = 0) {
  const river = riverAt(x, kind);
  return Math.abs(y - river.y) < river.halfWidth + margin;
}
export function clearGround(x: number, y: number, kind: LandscapeKind, margin = 0) {
  if (onWater(x, y, kind, margin + 7)) return false;
  if (Math.abs(y - pathAt(x, kind)) < 18 + margin) return false;
  if (kind === "garden") return Math.hypot(x / 1.8, y) > 26 + margin;
  // Reserve the complete jitter range around the existing tree plots.
  const column = Math.round((x - 17.5) / 150 + 3.5);
  const row = Math.round((y + 95) / 145);
  if (column >= 0 && column < 8 && row >= 0) {
    const cx = (column - 3.5) * 150 + 17.5;
    const cy = row * 145 - 95;
    if (Math.abs(x - cx) < 35 + margin && Math.abs(y - cy) < 25 + margin) return false;
  }
  return true;
}

/** Bounded local tile sampling stays stable when the camera crosses tile boundaries. */
export function terrainSamples(bounds: TerrainBounds, kind: LandscapeKind) {
  const samples: { id: string; seed: number; x: number; y: number; size: number; type: number }[] = [];
  const cell = 140;
  for (let tx = Math.floor(bounds.left / cell); tx <= Math.floor(bounds.right / cell); tx++) {
    for (let ty = Math.floor(Math.max(bounds.top, kind === "garden" ? -160 : bounds.top) / cell); ty <= Math.floor(bounds.bottom / cell); ty++) {
      const seed = seedFor(`terrain/${tx}/${ty}`);
      for (let i = 0; i < 9; i++) {
        const id = `${tx}/${ty}/${i}`;
        const detailSeed = seed ^ Math.imul(i + 1, 83492791);
        const x = tx * cell + randomFor(seed, i * 3) * cell;
        const y = ty * cell + randomFor(seed, i * 3 + 1) * cell;
        const size = 4 + randomFor(seed, i * 3 + 2) * 9;
        if ((kind !== "garden" || y >= -160) && clearGround(x, y, kind, size)) samples.push({ id, seed: detailSeed, x, y, size, type: i % 5 });
      }
    }
  }
  return samples.sort((a, b) => a.y - b.y);
}

const gardenAnimals: readonly Omit<Animal, "phase">[] = [
  { id: 11, kind: "rabbit", x: -165, y: 22, scale: 0.95, facing: 1 },
  { id: 12, kind: "squirrel", x: 133, y: 12, scale: 0.9, facing: -1 },
  { id: 13, kind: "robin", x: -214, y: -35, scale: 0.85, facing: 1 },
  { id: 14, kind: "duck", x: 103, y: 0, scale: 0.9, facing: -1 },
  { id: 15, kind: "duck", x: 145, y: 0, scale: 0.72, facing: -1 },
];
const forestAnimals: readonly Omit<Animal, "phase">[] = [
  { id: 21, kind: "rabbit", x: -190, y: 5, scale: 0.78, facing: 1 },
  { id: 22, kind: "squirrel", x: 108, y: 7, scale: 0.72, facing: -1 },
  { id: 23, kind: "robin", x: -340, y: 145, scale: 0.72, facing: 1 },
  { id: 24, kind: "duck", x: -118, y: 0, scale: 0.88, facing: 1 },
  { id: 25, kind: "duck", x: -78, y: 0, scale: 0.70, facing: 1 },
  { id: 26, kind: "rabbit", x: 270, y: 270, scale: 0.76, facing: -1 },
  { id: 27, kind: "robin", x: 395, y: -65, scale: 0.75, facing: -1 },
];
export function wildlifeFrame(kind: LandscapeKind, time: number, bounds: TerrainBounds): Animal[] {
  return (kind === "garden" ? gardenAnimals : forestAnimals).map(animal => {
    const phase = time + animal.id * 2.13;
    let { x, y, facing } = animal;
    if (animal.kind === "duck") {
      x += Math.sin(time * 0.13) * 35;
      y = riverAt(x, kind).y + (animal.id % 2 ? 4 : -3);
      facing = Math.cos(time * 0.13) >= 0 ? 1 : -1;
    }
    return { ...animal, x, y, facing, phase };
  }).filter(animal => animal.x > bounds.left - 35 && animal.x < bounds.right + 35 && animal.y > bounds.top - 35 && animal.y < bounds.bottom + 35)
    .sort((a, b) => a.y - b.y);
}
