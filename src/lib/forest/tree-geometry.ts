import { randomFor, seedFor } from "./model.ts";
import { growthProfile, smooth } from "./growth-profile.ts";

export interface Point { x: number; y: number }
export interface Branch {
  id: string;
  key: number;
  parent: string | null;
  start: Point;
  control: Point;
  end: Point;
  width: number;
  progress: number;
  depth: number;
  rear: boolean;
}
export interface Crown {
  id: string;
  key: number;
  center: Point;
  radius: number;
  opening: number;
  rear: boolean;
}
export interface Bounds { left: number; right: number; top: number; bottom: number }
export interface TreeGeometry {
  branches: Branch[];
  crowns: Crown[];
  bounds: Bounds;
  profile: ReturnType<typeof growthProfile>;
}
interface Limb {
  id: string;
  key: number;
  parent: string;
  attach: number;
  angle: number;
  length: number;
  birth: number;
  duration: number;
  depth: number;
  rear: boolean;
}
export const TREE_GENERATOR_VERSION = 2;
const skeletons = new Map<number, readonly Limb[]>();
/** Fixed budget: 8 primary limbs, each with two generations of attached forks. */
function skeleton(seed: number): readonly Limb[] {
  const existing = skeletons.get(seed);
  if (existing) return existing;
  const limbs: Limb[] = [];
  function add(id: string, parent: string, attach: number, angle: number, length: number, birth: number, depth: number, rear: boolean) {
    const key = seedFor(`${TREE_GENERATOR_VERSION}/${seed}/${id}`);
    const duration = 3 + depth * 7;
    limbs.push({ id, key, parent, attach, angle, length, birth, duration, depth, rear });
    if (depth < 3) {
      for (let j = 0; j < 2; j++) {
        add(`${id}/${j}`, id, 0.68 + j * 0.27, angle * 0.66 + (j ? 0.48 : -0.5), length * (0.56 + randomFor(key, j) * 0.13), birth + 2.4 + depth * 3 + j, depth + 1, rear);
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    const direction = i % 2 ? 1 : -1;
    add(`trunk/${i}`, "trunk", 0.42 + i * 0.063 + (randomFor(seed, i + 54) - 0.5) * 0.045, direction * (0.95 - i * 0.028 + randomFor(seed, i) * 0.26), 0.37 - i * 0.019, 1.6 + i * 0.85, 1, i % 3 === 0);
  }
  // Upright interior shoots fill the crown in depth instead of leaving a ladder-like gap.
  for (let i = 0; i < 5; i++) {
    const id = `trunk/interior/${i}`;
    limbs.push({ id, key: seedFor(`${TREE_GENERATOR_VERSION}/${seed}/${id}`), parent: "trunk",
      attach: 0.57 + i * 0.078, angle: (i % 2 ? 1 : -1) * (0.35 + randomFor(seed, i + 710) * 0.30),
      length: 0.11, birth: 4 + i * 1.8, duration: 12, depth: 1, rear: i % 2 === 0 });
  }
  if (skeletons.size >= 96) skeletons.delete(skeletons.keys().next().value!);
  skeletons.set(seed, limbs);
  return limbs;
}
export function curvePoint(branch: Pick<Branch, "start" | "control" | "end">, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * branch.start.x + 2 * u * t * branch.control.x + t * t * branch.end.x,
    y: u * u * branch.start.y + 2 * u * t * branch.control.y + t * t * branch.end.y,
  };
}
/** Geometry depends on identity and growth, never health, time, or display quality. */
export function createTreeGeometry(seed: number, growth: number): TreeGeometry {
  const profile = growthProfile(growth);
  const { height, width, trunk } = profile;
  const lean = (randomFor(seed, 817) - 0.5) * height * 0.09;
  const stem: Branch = {
    id: "trunk", key: seed, parent: null, start: { x: 0, y: 0 },
    control: { x: lean - height * 0.055, y: -height * 0.48 },
    end: { x: lean, y: -height * 0.86 },
    width: trunk, progress: profile.emergence, depth: 0, rear: false,
  };
  const branches = [stem];
  const byId = new Map([[stem.id, stem]]);
  const crowns: Crown[] = [];
  for (const limb of skeleton(seed)) {
    const parent = byId.get(limb.parent)!;
    const progress = smooth(limb.birth, limb.birth + limb.duration, growth) * parent.progress;
    const start = curvePoint(parent, limb.attach);
    const end = {
      x: start.x + Math.sin(limb.angle) * width * limb.length * 0.74 * progress,
      y: start.y - Math.cos(limb.angle) * height * limb.length * 0.72 * progress,
    };
    const branch: Branch = {
      ...limb, start, end, progress,
      control: { x: start.x + (end.x - start.x) * 0.42, y: start.y + (end.y - start.y) * 0.75 + height * 0.018 * progress },
      width: trunk * Math.pow(0.54, limb.depth) * progress,
    };
    branches.push(branch);
    byId.set(limb.id, branch);
    const opening = smooth(limb.birth + 0.6, limb.birth + limb.duration + 2.5, growth) * parent.progress;
    crowns.push({
      id: `${limb.id}/leaves`, key: limb.key, center: end,
      radius: width * (0.205 - limb.depth * 0.018) * opening,
      opening, rear: limb.rear,
    });
  }
  const apex = smooth(0.6, 4, growth);
  crowns.push({ id: "trunk/leaves", key: seedFor(`apex/${seed}`), center: stem.end, radius: width * 0.20 * apex, opening: apex, rear: false });
  const bounds: Bounds = { left: -0.1, right: 0.1, top: -0.12, bottom: 0.07 };
  for (const b of branches) {
    bounds.left = Math.min(bounds.left, b.start.x - b.width, b.end.x - b.width);
    bounds.right = Math.max(bounds.right, b.start.x + b.width, b.end.x + b.width);
    bounds.top = Math.min(bounds.top, b.end.y - b.width);
  }
  for (const c of crowns) {
    // Includes leaf tips, wind allowance, and health droop.
    bounds.left = Math.min(bounds.left, c.center.x - c.radius * 1.55);
    bounds.right = Math.max(bounds.right, c.center.x + c.radius * 1.55);
    bounds.top = Math.min(bounds.top, c.center.y - c.radius * 1.4);
    bounds.bottom = Math.max(bounds.bottom, c.center.y + c.radius * 1.6);
  }
  bounds.left = Math.min(bounds.left, -trunk * 2.7);
  bounds.right = Math.max(bounds.right, trunk * 2.7);
  bounds.bottom = Math.max(bounds.bottom, trunk * 0.65 * profile.roots);
  if (profile.cotyledons > 0) {
    const anchor = curvePoint(stem, 0.78);
    const length = (0.075 + width * 0.45) * profile.cotyledons;
    bounds.left = Math.min(bounds.left, anchor.x - length);
    bounds.right = Math.max(bounds.right, anchor.x + length);
    bounds.top = Math.min(bounds.top, anchor.y - length);
  }
  return { branches, crowns, bounds, profile };
}
