import { randomFor } from "@/lib/forest/model";
import { riverAt, type LandscapeKind, type TerrainBounds } from "@/lib/forest/landscape-model";
import { paintGrass, paintRock } from "./terrain-details";
import { ellipse, type Context } from "./scene-theme";

function channel(ctx: Context, bounds: TerrainBounds, kind: LandscapeKind, extra = 0, fraction = 1) {
  const first = Math.floor(bounds.left / 24) - 1;
  const last = Math.ceil(bounds.right / 24) + 1;
  ctx.beginPath();
  for (let side = 0; side < 2; side++) {
    for (let i = first; i <= last; i++) {
      const index = side ? last - (i - first) : i;
      const x = index * 24;
      const river = riverAt(x, kind);
      const y = river.y + (side ? 1 : -1) * (river.halfWidth * fraction + extra);
      if (!side && i === first) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

export function paintRiver(ctx: Context, bounds: TerrainBounds, kind: LandscapeKind) {
  const riverY = kind === "garden" ? -82 : 110;
  if (bounds.top > riverY + 65 || bounds.bottom < riverY - 65) return;
  ctx.save();
  channel(ctx, bounds, kind, 9); ctx.fillStyle = "#617b4f"; ctx.fill();
  channel(ctx, bounds, kind, 6); ctx.fillStyle = "#aaab81"; ctx.fill();
  channel(ctx, bounds, kind, 2.5); ctx.fillStyle = "#526e5e"; ctx.fill();
  const water = ctx.createLinearGradient(0, riverY - 38, 0, riverY + 38);
  water.addColorStop(0, "#466f68");
  water.addColorStop(0.25, "#608b7f");
  water.addColorStop(0.55, "#82b1a1");
  water.addColorStop(0.85, "#a0c7ae");
  water.addColorStop(1, "#6e9988");
  channel(ctx, bounds, kind); ctx.fillStyle = water; ctx.fill();
  channel(ctx, bounds, kind, 0, 0.55); ctx.fillStyle = "#385f6418"; ctx.fill();
  ctx.save(); channel(ctx, bounds, kind); ctx.clip();
  for (let i = Math.floor(bounds.left / 31); i <= Math.ceil(bounds.right / 31); i++) {
    const x = i * 31 + randomFor(371, i) * 15;
    const river = riverAt(x, kind);
    // Submerged stones stay visible through the shallow, lighter edges.
    const side = i % 2 ? 1 : -1;
    ellipse(ctx, x, river.y + side * river.halfWidth * 0.73, 2 + randomFor(372, i) * 5, 1.5,
      i % 3 ? "#d1d2ab35" : "#365f5930", -0.2);
    ctx.strokeStyle = "#d6e8c430"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x - 5, river.y - river.halfWidth * 0.4);
    ctx.quadraticCurveTo(x + 6, river.y - river.halfWidth * 0.5, x + 20, river.y - river.halfWidth * 0.35); ctx.stroke();
  }
  ctx.restore();
  // Irregular bank groups break the silhouette of an otherwise smooth channel.
  for (let i = Math.floor(bounds.left / 63); i <= Math.ceil(bounds.right / 63); i++) {
    const x = i * 63 + randomFor(803, i) * 20;
    const river = riverAt(x, kind);
    const side = i % 2 ? 1 : -1;
    const y = river.y + side * (river.halfWidth + 3);
    if (i % 3 === 0) {
      paintRock(ctx, x, y + 2, 5 + randomFor(805, i) * 6, i + 210, true);
      paintRock(ctx, x + 10, y + 3, 3.5, i + 99, true);
    } else paintGrass(ctx, x, y + 3, 12 + randomFor(804, i) * 8, i + 311, true);
  }
  ctx.restore();
}

export function paintWaterMotion(ctx: Context, bounds: TerrainBounds, kind: LandscapeKind, time: number) {
  const riverY = kind === "garden" ? -82 : 110;
  if (bounds.top > riverY + 65 || bounds.bottom < riverY - 65) return;
  ctx.save(); channel(ctx, bounds, kind); ctx.clip();
  for (let i = Math.floor(bounds.left / 65) - 1; i <= Math.ceil(bounds.right / 65); i++) {
    const travel = (time * 4 + randomFor(883, i) * 65) % 65;
    const x = i * 65 + travel;
    if (Math.abs(x - (kind === "garden" ? -285 : -660)) < 34) continue;
    const river = riverAt(x, kind);
    const y = river.y + (randomFor(884, i) - 0.5) * river.halfWidth;
    ctx.globalAlpha = Math.sin(travel / 65 * Math.PI) * 0.48;
    ctx.strokeStyle = "#e5f1d5"; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x, y + 1.5, x + 11, y + river.slope * 10);
    ctx.stroke();
    if (i % 3 === 0) {
      ctx.globalAlpha *= 0.6;
      ctx.beginPath(); ctx.moveTo(x - 4, y + 4); ctx.lineTo(x + 6, y + 3); ctx.stroke();
    }
  }
  ctx.restore();
}

export function paintBridge(ctx: Context, x: number, kind: LandscapeKind) {
  const river = riverAt(x, kind);
  const top = river.y - river.halfWidth - 14;
  const bottom = river.y + river.halfWidth + 15;
  ctx.save();
  ctx.fillStyle = "#253c3438";
  ctx.fillRect(x - 16, top + 6, 40, bottom - top);
  ctx.fillStyle = "#705b3e";
  ctx.fillRect(x - 20, top, 40, bottom - top);
  for (let y = top; y < bottom; y += 6) {
    const lift = Math.sin((y - top) / (bottom - top) * Math.PI) * 3;
    ctx.fillStyle = Math.floor(y / 6) % 2 ? "#b59c70" : "#c0aa7a";
    ctx.fillRect(x - 19, y - lift, 38, 5);
    ctx.strokeStyle = "#7b684348"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x - 15, y + 2 - lift); ctx.lineTo(x + 11, y + 1 - lift); ctx.stroke();
  }
  for (const side of [-1, 1]) {
    ctx.strokeStyle = "#756246"; ctx.lineWidth = 2.7;
    ctx.beginPath(); ctx.moveTo(x + side * 18, top - 9);
    ctx.quadraticCurveTo(x + side * 18, (top + bottom) / 2 - 16, x + side * 18, bottom - 9); ctx.stroke();
    ctx.strokeStyle = "#d0bc8c"; ctx.lineWidth = 1;
    ctx.stroke();
    for (const y of [top, (top + bottom) / 2, bottom]) {
      ctx.fillStyle = "#766344"; ctx.fillRect(x + side * 18 - 1.5, y - 11, 3, 13);
      ellipse(ctx, x + side * 18, y - 11, 2.5, 1.2, "#d6c493");
    }
  }
  ctx.restore();
}
