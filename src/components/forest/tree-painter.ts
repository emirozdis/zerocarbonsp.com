import { randomFor, type Plant } from "@/lib/forest/model";
import { smooth, clamp01 } from "@/lib/forest/growth-profile";
import { createTreeGeometry, curvePoint, type Branch, type Crown, type TreeGeometry } from "@/lib/forest/tree-geometry";
import { ellipse, leafColor, paintLeaf, type Context } from "./scene-theme";

function wood(ctx: Context, branch: Branch, scale: number, detail: number, woodiness: number) {
  if (branch.progress < 0.00001) return;
  const width = branch.width * scale;
  const points = Array.from({ length: 10 }, (_, i) => curvePoint(branch, i / 9));
  // A tapered closed ribbon gives forks volume without round line caps.
  ctx.beginPath();
  for (let side = 0; side < 2; side++) {
    for (let k = 0; k < points.length; k++) {
      const i = side ? points.length - 1 - k : k;
      const p = points[i], next = points[Math.min(i + 1, points.length - 1)], prev = points[Math.max(0, i - 1)];
      const angle = Math.atan2(next.y - prev.y, next.x - prev.x) + Math.PI / 2;
      const radius = width * (0.52 - (i / 9) * 0.39) * (side ? -1 : 1);
      const x = p.x * scale + Math.cos(angle) * radius;
      const y = p.y * scale + Math.sin(angle) * radius;
      if (!side && !k) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  const shade = ctx.createLinearGradient(branch.start.x * scale - width, 0, branch.start.x * scale + width, 0);
  shade.addColorStop(0, `hsl(${85 - woodiness * 54} 26% 24%)`);
  shade.addColorStop(0.32, `hsl(${85 - woodiness * 49} 30% 47%)`);
  shade.addColorStop(0.52, `hsl(${85 - woodiness * 52} 27% 34%)`);
  shade.addColorStop(1, `hsl(${85 - woodiness * 57} 25% 21%)`);
  ctx.fillStyle = shade;
  ctx.fill();
  if (detail <= 0 || width < 2) return;
  ctx.save();
  ctx.clip();
  ctx.globalAlpha *= detail * woodiness;
  for (let i = 0; i < (branch.depth < 2 ? 18 : 5); i++) {
    const t = randomFor(branch.key, i + 901) * 0.9;
    const p = curvePoint(branch, t), q = curvePoint(branch, Math.min(1, t + 0.06 + randomFor(branch.key, i + 78) * 0.18));
    const offset = (randomFor(branch.key, i + 710) - 0.5) * width;
    ctx.strokeStyle = i % 3 ? "#352f2370" : "#ead1a275";
    ctx.lineWidth = Math.max(0.5, width * 0.038);
    ctx.beginPath();
    ctx.moveTo(p.x * scale + offset, p.y * scale);
    ctx.quadraticCurveTo((p.x + q.x) / 2 * scale + offset + width * 0.10, (p.y + q.y) / 2 * scale, q.x * scale + offset, q.y * scale);
    ctx.stroke();
  }
  if (!branch.depth && width > 7) {
    const knot = curvePoint(branch, 0.37);
    ellipse(ctx, knot.x * scale, knot.y * scale, width * 0.19, width * 0.38, "#493b2d");
    ellipse(ctx, knot.x * scale - 0.5, knot.y * scale, width * 0.10, width * 0.26, "#ad8d5d");
    ellipse(ctx, knot.x * scale, knot.y * scale, width * 0.05, width * 0.18, "#594733");
  }
  ctx.restore();
}
function foliage(ctx: Context, crown: Crown, scale: number, health: number, time: number, detail: number) {
  const r = crown.radius * scale;
  if (r < 0.025) return;
  const vitality = clamp01(health / 100);
  const droop = (1 - vitality) * r * 0.32;
  const flutter = Math.sin(time * 1.1 + (crown.key % 41)) * r * 0.023;
  const x = crown.center.x * scale + flutter, y = crown.center.y * scale + droop;
  ctx.save();
  ctx.translate(x, y);
  // Irregular connected masses provide volume; small pointed leaves articulate the edge.
  const shade = ctx.createRadialGradient(-r * 0.3, -r * 0.45, 0, 0, 0, r * 1.15);
  shade.addColorStop(0, leafColor(health, 0.67, crown.rear));
  shade.addColorStop(0.62, leafColor(health, 0.30, crown.rear));
  shade.addColorStop(1, leafColor(health, 0.02, crown.rear));
  ctx.fillStyle = shade;
  ctx.globalAlpha = crown.opening * (0.2 + vitality * 0.8);
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const a = (i % 20) / 20 * Math.PI * 2;
    const radius = r * (0.66 + randomFor(crown.key, (i % 20) + 250) * 0.32);
    const px = Math.cos(a) * radius, py = Math.sin(a) * radius * 0.72;
    if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // Fixed count and placement preserve the outline at every zoom and health level.
  for (let j = 0; j < 32; j++) {
    const theta = randomFor(crown.key, j * 7) * Math.PI * 2;
    const distance = Math.sqrt(randomFor(crown.key, j * 7 + 1)) * r;
    const lx = Math.cos(theta) * distance, ly = Math.sin(theta) * distance * 0.73;
    const survival = smooth(randomFor(crown.key, j + 160) * 0.65 - 0.20, randomFor(crown.key, j + 160) * 0.65 + 0.12, vitality);
    const opening = smooth(j / 90, j / 90 + 0.65, crown.opening);
    ctx.globalAlpha = survival * opening;
    if (ctx.globalAlpha < 0.01) continue;
    const length = r * (0.30 + randomFor(crown.key, j * 7 + 2) * 0.31) * opening;
    const tone = clamp01(0.40 + randomFor(crown.key, j * 7 + 3) * 0.45 - ly / r * 0.24);
    paintLeaf(ctx, lx, ly, length, theta * 0.55 + Math.sin(time * 1.8 + j) * 0.035 + (1 - vitality) * 0.65, leafColor(health, tone, crown.rear), detail);
  }
  ctx.restore();
}
export function paintTree(ctx: Context, plant: Pick<Plant, "growth" | "seed" | "health">, x: number, y: number, scale: number, time = 0, detail = 1, geometry: TreeGeometry = createTreeGeometry(plant.seed, plant.growth)) {
  const { seed, growth, health } = plant;
  const { profile, branches, crowns } = geometry;
  ctx.save();
  ctx.translate(x, y);
  const rootSize = Math.max(0.09, profile.trunk * 2.4) * scale;
  const groundShadow = ctx.createRadialGradient(0, 0, 0, 0, 0, rootSize * 1.5);
  groundShadow.addColorStop(0, "#24352260");
  groundShadow.addColorStop(1, "#24352200");
  ellipse(ctx, 3, 3, rootSize * 1.5, Math.max(3, rootSize * 0.30), groundShadow);
  // Seed halves separate continuously before fading beneath the shoot.
  ctx.save();
  ctx.globalAlpha = 1 - smooth(0.35, 2, growth);
  const seedScale = Math.max(120, scale);
  for (const side of [-1, 1]) {
    const sx = side * (0.022 + profile.emergence * 0.035) * seedScale;
    ellipse(ctx, sx, -seedScale * 0.027, seedScale * 0.044, seedScale * 0.065, "#725039", side * (0.35 + profile.emergence));
    ellipse(ctx, sx - seedScale * 0.012, -seedScale * 0.045, seedScale * 0.015, seedScale * 0.031, "#b7955b", side * 0.4);
    ctx.strokeStyle = "#cfb07790"; ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx - seedScale * 0.022, -seedScale * 0.067);
    ctx.quadraticCurveTo(sx + seedScale * 0.004, -seedScale * 0.02, sx - seedScale * 0.016, seedScale * 0.018);
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 7; i++) {
    const angle = i / 7 * Math.PI * 2 + randomFor(seed, 422) * 0.3;
    const length = profile.trunk * (1.4 + randomFor(seed, i + 601)) * profile.roots;
    const root: Branch = {
      id: `root/${i}`, key: seed + i, parent: null, depth: 1, rear: false, progress: profile.roots,
      start: { x: 0, y: -profile.trunk * 0.7 },
      control: { x: Math.cos(angle) * length * 0.35, y: Math.sin(angle) * length * 0.15 },
      end: { x: Math.cos(angle) * length, y: Math.sin(angle) * length * 0.25 },
      width: profile.trunk * 0.65 * profile.roots,
    };
    wood(ctx, root, scale, detail, 1);
  }
  // Wind bends the crown gently while the rooted base remains stationary.
  ctx.transform(1, 0, Math.sin(time * 0.7 + seed % 19) * 0.006, 1, 0, 0);
  for (const c of crowns) if (c.rear) foliage(ctx, c, scale, health, time, detail);
  for (const b of branches) wood(ctx, b, scale, detail, profile.wood);
  for (const c of crowns) if (!c.rear) foliage(ctx, c, scale, health, time, detail);
  if (profile.cotyledons > 0.001) {
    const anchor = curvePoint(branches[0], 0.78);
    ctx.globalAlpha = profile.cotyledons;
    for (const side of [-1, 1]) {
      paintLeaf(ctx, anchor.x * scale, anchor.y * scale, (0.075 + profile.width * 0.45) * scale * profile.cotyledons, side * 0.96, leafColor(health, side < 0 ? 0.8 : 0.55), detail);
    }
  }
  ctx.restore();
}
export function plotPosition(plant: Pick<Plant, "plot" | "seed">) {
  return {
    x: ((plant.plot % 5) - 2) * 150 + randomFor(plant.seed, 811) * 35,
    y: Math.floor(plant.plot / 5) * 180 - 110 + randomFor(plant.seed, 812) * 30,
  };
}
