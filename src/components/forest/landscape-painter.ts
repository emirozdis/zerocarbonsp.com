import { randomFor } from "@/lib/forest/model";
import { pathAt, riverAt, terrainSamples, type TerrainBounds, type LandscapeKind } from "@/lib/forest/landscape-model";
import { ellipse, SCENE, type Context } from "./scene-theme";
import { paintFallenLog, paintFern, paintFlowers, paintGrass, paintRock } from "./terrain-details";
import { paintBridge, paintRiver } from "./water-painter";

type Material = "meadow" | "gravel";

/** Tile textures are created once; placements and lighting stay in world coordinates. */
function material(ctx: Context, kind: Material) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 384;
  const brush = tile.getContext("2d");
  if (!brush) return null;
  brush.fillStyle = kind === "meadow" ? "#92a477" : "#c7b58e";
  brush.fillRect(0, 0, 384, 384);
  for (let i = 0; i < 45; i++) {
    const x = randomFor(91, i) * 384, y = randomFor(92, i) * 384;
    const radius = 12 + randomFor(93, i) * 40;
    for (const dx of [-384, 0, 384]) for (const dy of [-384, 0, 384]) {
      ellipse(brush, x + dx, y + dy, radius, radius * 0.40,
        i % 2 ? "#e3d6a311" : "#476b3910");
    }
  }
  for (let i = 0; i < 2800; i++) {
    const x = randomFor(101, i) * 384, y = randomFor(102, i) * 384;
    brush.fillStyle = i % 3 ? "#e5d4a532" : "#35482f20";
    brush.fillRect(x, y, 0.5 + randomFor(103, i) * 1.4, 0.6);
  }
  for (let i = 0; i < 180; i++) {
    const x = 4 + randomFor(201, i) * 376, y = 8 + randomFor(202, i) * 368;
    if (kind === "gravel") ellipse(brush, x, y, 0.5 + randomFor(203, i) * 1.5, 0.7,
      i % 2 ? "#ebd9b778" : "#74684b40", -0.3);
    else paintGrass(brush, x, y, 2 + randomFor(203, i) * 2.5, i + 5);
  }
  return ctx.createPattern(tile, "repeat");
}

function distantWoods(ctx: Context, bounds: TerrainBounds) {
  const sky = ctx.createLinearGradient(0, -700, 0, -130);
  sky.addColorStop(0, "#c8dbda"); sky.addColorStop(0.6, "#d5e0d4"); sky.addColorStop(1, "#e8e7cb");
  ctx.fillStyle = sky;
  ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
  const light = ctx.createRadialGradient(-280, -450, 0, -280, -450, 600);
  light.addColorStop(0, "#fff2c754"); light.addColorStop(1, "#fff2c700");
  ctx.fillStyle = light;
  ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
  for (let i = Math.floor(bounds.left / 620); i <= Math.ceil(bounds.right / 620); i++) {
    const x = i * 620;
    for (let j = 0; j < 4; j++) ellipse(ctx, x + 60 + j * 36, -415 + Math.sin(j) * 7,
      88 + j * 8, 8 + j * 2, "#fff9e01c");
  }
  for (let layer = 0; layer < 3; layer++) {
    const step = 115, base = -263 + layer * 40;
    const gradient = ctx.createLinearGradient(0, base - 65, 0, base + 130);
    gradient.addColorStop(0, ["#a7bcb1", "#93ae98", "#819d7c"][layer]);
    gradient.addColorStop(1, ["#d1dcc4", "#b3c5a5", "#a1b68c"][layer]);
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.moveTo(bounds.left - step, -100);
    for (let i = Math.floor(bounds.left / step) - 1; i <= Math.ceil(bounds.right / step) + 1; i++) {
      const y = base - randomFor(401 + layer, i) * (62 - layer * 12);
      const next = base - randomFor(401 + layer, i + 1) * (62 - layer * 12);
      if (i === Math.floor(bounds.left / step) - 1) ctx.lineTo(i * step, y);
      ctx.bezierCurveTo((i + 0.4) * step, y, (i + 0.6) * step, next, (i + 1) * step, next);
    }
    ctx.lineTo(bounds.right + step, -100); ctx.closePath(); ctx.fill();
  }
  // Groups of distant trees with uneven gaps, heights and crown shapes.
  for (let i = Math.floor(bounds.left / 25) - 1; i <= Math.ceil(bounds.right / 25) + 1; i++) {
    if (randomFor(481, i) < 0.14) continue;
    const x = i * 25 + randomFor(482, i) * 15;
    const y = -153 + Math.sin(i * 0.19) * 6;
    const height = 19 + randomFor(501, i) * 42;
    ctx.strokeStyle = "#687f605b"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 1, y - height); ctx.stroke();
    for (let j = 0; j < 7; j++) {
      const rx = (randomFor(512 + j, i) - 0.5) * height * 0.53;
      const ry = y - height * (0.45 + randomFor(532 + j, i) * 0.5);
      ellipse(ctx, x + rx, ry, height * 0.24, height * 0.20,
        ["#80966f", "#8fa47b", "#94a881", "#9cae87"][j % 4]);
    }
  }
  const mist = ctx.createLinearGradient(0, -250, 0, -145);
  mist.addColorStop(0, "#e4e9cf00"); mist.addColorStop(0.7, "#e4e9cf24"); mist.addColorStop(1, "#e4e9cf00");
  ctx.fillStyle = mist;
  ctx.fillRect(bounds.left, -250, bounds.right - bounds.left, 110);
}

/** Static terrain is cached by the renderer; only water and animal motion redraw. */
export function createLandscapePainter(ctx: Context) {
  const meadow = material(ctx, "meadow") ?? SCENE.meadow;
  const gravel = material(ctx, "gravel") ?? SCENE.gravel;

  function terrain(bounds: TerrainBounds, kind: LandscapeKind, scale: number) {
    const top = kind === "garden" ? Math.max(-151, bounds.top) : bounds.top;
    ctx.save();
    ctx.beginPath(); ctx.rect(bounds.left, top, bounds.right - bounds.left, Math.max(0, bounds.bottom - top)); ctx.clip();
    ctx.fillStyle = meadow;
    ctx.fillRect(bounds.left, top, bounds.right - bounds.left, Math.max(0, bounds.bottom - top));
    // Broad grass and soil variations give the meadow relief without a repeating grid.
    if (scale >= 0.25) for (let tx = Math.floor(bounds.left / 250); tx <= Math.ceil(bounds.right / 250); tx++) {
      for (let ty = Math.floor(top / 180); ty <= Math.ceil(bounds.bottom / 180); ty++) {
        const seed = Math.imul(tx, 73129) ^ Math.imul(ty, 98317);
        const x = tx * 250 + randomFor(seed, 1) * 130;
        const y = ty * 180 + randomFor(seed, 2) * 100;
        const radius = 90 + randomFor(seed, 3) * 70;
        const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
        light.addColorStop(0, seed % 2 ? "#dfd99b24" : "#3d713428");
        light.addColorStop(1, seed % 2 ? "#dfd99b00" : "#3d713400");
        ellipse(ctx, x, y, radius, radius * 0.5, light);
      }
    }
    ctx.restore();
  }
  function path(draw: () => void, width: number) {
    ctx.lineCap = "round";
    ctx.beginPath(); draw();
    ctx.strokeStyle = "#556b3c38"; ctx.lineWidth = width + 8; ctx.stroke();
    ctx.strokeStyle = "#b4ad80"; ctx.lineWidth = width + 3; ctx.stroke();
    ctx.strokeStyle = gravel; ctx.lineWidth = width; ctx.stroke();
  }
  function paths(bounds: TerrainBounds, kind: LandscapeKind) {
    const first = Math.floor(bounds.left / 25) - 1, last = Math.ceil(bounds.right / 25) + 1;
    path(() => {
      for (let i = first; i <= last; i++) {
        const x = i * 25, y = pathAt(x, kind);
        if (i === first) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
    }, kind === "garden" ? 26 : 31);
    const bridgeX = kind === "garden" ? -285 : -660;
    if (bridgeX > bounds.left - 35 && bridgeX < bounds.right + 35) {
      path(() => {
        ctx.moveTo(bridgeX - 25, pathAt(bridgeX - 25, kind));
        ctx.quadraticCurveTo(bridgeX + 3, pathAt(bridgeX, kind), bridgeX, kind === "garden" ? Math.max(-143, riverAt(bridgeX, kind).y - 47) : riverAt(bridgeX, kind).y + 62);
      }, 20);
    }
  }
  function details(bounds: TerrainBounds, kind: LandscapeKind, scale: number) {
    if (scale < 0.25) return;
    for (const point of terrainSamples(bounds, kind)) {
      if (kind === "garden" && point.y < -147) continue;
      if (point.size * scale < 3) continue;
      if (point.size * scale < 5 && point.type !== 0) {
        paintGrass(ctx, point.x, point.y, point.size * 0.65, point.seed);
        continue;
      }
      if (point.type === 0) {
        paintRock(ctx, point.x, point.y, point.size * 0.75, point.seed);
        paintGrass(ctx, point.x - point.size * 0.6, point.y + 2, point.size * 0.6, point.seed);
      } else if (point.type === 1) paintFern(ctx, point.x, point.y, point.size, point.seed);
      else if (point.type === 2) paintFlowers(ctx, point.x, point.y, point.size, point.seed);
      else paintGrass(ctx, point.x, point.y, point.size * 0.65, point.seed);
    }
  }
  function ground(bounds: TerrainBounds, kind: LandscapeKind, scale: number) {
    terrain(bounds, kind, scale);
    paths(bounds, kind);
    paintRiver(ctx, bounds, kind);
    details(bounds, kind, scale);
    const bridgeX = kind === "garden" ? -285 : -660;
    if (bridgeX > bounds.left - 35 && bridgeX < bounds.right + 35) paintBridge(ctx, bridgeX, kind);
  }
  return {
    garden(bounds: TerrainBounds, scale = 1) {
      distantWoods(ctx, bounds);
      ground(bounds, "garden", scale);
      ellipse(ctx, 0, 1, 34, 11, "#7c7350");
      for (let i = 0; i < 85; i++) {
        const angle = randomFor(601, i) * Math.PI * 2, radius = Math.sqrt(randomFor(602, i));
        ellipse(ctx, Math.cos(angle) * radius * 32, 1 + Math.sin(angle) * radius * 9,
          1.3, 0.6, i % 2 ? "#c1af7b" : "#575337", angle);
      }
      paintRock(ctx, -216, -34, 11, 41);
      paintRock(ctx, -220, 31, 20, 12);
      paintRock(ctx, -197, 38, 11, 19);
      paintFern(ctx, -233, 31, 16, 18);
      paintFlowers(ctx, -180, 32, 10, 25);
      paintFallenLog(ctx, 194, 8, 31);
      paintFern(ctx, 223, 9, 15, 85);
      paintRock(ctx, 98, 26, 9, 48);
    },
    forest(bounds: TerrainBounds, scale = 1) {
      ground(bounds, "forest", scale);
      for (const [x, y, size] of [[-345, 149, 11], [238, 270, 22], [90, 9, 19], [-655, 168, 14]]) {
        if (x < bounds.left - 30 || x > bounds.right + 30 || y < bounds.top - 30 || y > bounds.bottom + 30) continue;
        paintRock(ctx, x, y, size, x + 911);
        paintFern(ctx, x - size, y + 1, size * 0.8, x + 913);
      }
      if (bounds.left < 430 && bounds.right > 350 && bounds.top < -45 && bounds.bottom > -80) paintFallenLog(ctx, 395, -60, 27);
    },
  };
}
