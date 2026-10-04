import { randomFor } from "@/lib/forest/model";
import { ellipse, paintLeaf, type Context } from "./scene-theme";

/** Shaded irregular stones, shared by banks, meadow clusters, and the tree clearing. */
export function paintRock(ctx: Context, x: number, y: number, size: number, seed = 1, wet = false) {
  ctx.save();
  ctx.translate(x, y);
  const height = size * (0.70 + randomFor(seed, 1) * 0.32);
  ellipse(ctx, size * 0.17, 2, size * 1.12, size * 0.27, "#263b3038");
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.lineTo(-size * 0.88, -height * 0.55);
  ctx.lineTo(-size * 0.31, -height);
  ctx.lineTo(size * 0.29, -height * 0.96);
  ctx.lineTo(size * 0.85, -height * 0.50);
  ctx.lineTo(size, -height * 0.04);
  ctx.quadraticCurveTo(size * 0.15, height * 0.22, -size, 0);
  const body = ctx.createLinearGradient(-size, -height, size, 0);
  body.addColorStop(0, wet ? "#a8aaa0" : "#b6b6a1");
  body.addColorStop(0.45, wet ? "#737f79" : "#8e9685");
  body.addColorStop(1, wet ? "#4d655f" : "#626f60");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = wet ? "#d4ddd14a" : "#ede6ce55";
  ctx.beginPath();
  ctx.moveTo(-size, -height * 0.15);
  ctx.lineTo(-size * 0.31, -height);
  ctx.lineTo(size * 0.29, -height * 0.96);
  ctx.lineTo(size * 0.10, -height * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3d514539";
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(size * 0.10, -height * 0.35);
  ctx.lineTo(size * 0.35, -height * 0.06);
  ctx.moveTo(-size * 0.31, -height);
  ctx.lineTo(-size * 0.44, -height * 0.51);
  ctx.stroke();
  for (let i = 0; i < 20; i++) {
    ellipse(ctx, (randomFor(seed, i + 10) * 2 - 1) * size, -randomFor(seed, i + 30) * height,
      0.3 + randomFor(seed, i + 50), 0.35, i % 2 ? "#e7e0c63c" : "#283f3439");
  }
  if (!wet) {
    for (let i = 0; i < 6; i++) ellipse(ctx, -size * 0.6 + randomFor(seed, i + 80) * size * 0.5,
      -height * (0.3 + randomFor(seed, i + 90) * 0.2), size * 0.12, size * 0.06, "#6c844b80");
  }
  ctx.restore();
  ctx.restore();
}

export function paintGrass(ctx: Context, x: number, y: number, size: number, seed: number, reeds = false) {
  ctx.lineCap = "round";
  for (let i = 0; i < (reeds ? 7 : 5); i++) {
    const dx = (randomFor(seed, i) - 0.5) * size * 1.1;
    const height = size * (0.55 + randomFor(seed, i + 15) * 0.65);
    const tx = x + dx, ty = y - height;
    ctx.strokeStyle = ["#516d43", "#94a367", "#b9bd7e", "#688551", "#809957"][i % 5];
    ctx.lineWidth = reeds ? 1.2 : 0.8;
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.13, y);
    ctx.quadraticCurveTo(x + dx * 0.15, y - height * 0.75, tx, ty);
    ctx.stroke();
    if (reeds && i % 3 === 0) {
      ctx.strokeStyle = "#766247";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(tx, ty + 1);
      ctx.lineTo(tx - dx * 0.06, ty - size * 0.19);
      ctx.stroke();
    }
  }
}

export function paintFern(ctx: Context, x: number, y: number, size: number, seed: number) {
  ellipse(ctx, x + 2, y + 1, size * 0.8, size * 0.20, "#2d4a2920");
  for (let i = 0; i < 5; i++) {
    const angle = (i - 2) * 0.44;
    const length = size * (0.9 + randomFor(seed, i) * 0.4);
    ctx.strokeStyle = "#648149";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.sin(angle) * length * 0.2, y - length * 0.8, x + Math.sin(angle) * length, y - Math.cos(angle) * length);
    ctx.stroke();
    for (let j = 1; j < 5; j++) {
      const t = j / 5;
      const px = x + Math.sin(angle) * length * t * t;
      const py = y - length * t;
      for (const side of [-1, 1]) paintLeaf(ctx, px, py, length * 0.24 * (1.25 - t), angle + side * 1.04,
        side < 0 ? "#88a25b" : "#537b47", 0.35);
    }
  }
}

export function paintFlowers(ctx: Context, x: number, y: number, size: number, seed: number) {
  paintGrass(ctx, x, y, size * 0.65, seed);
  for (let i = 0; i < 3; i++) {
    const px = x + (randomFor(seed, i + 2) - 0.5) * size;
    const py = y - size * (0.55 + randomFor(seed, i + 5) * 0.55);
    ctx.strokeStyle = "#6b834d";
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(px, py); ctx.stroke();
    for (let j = 0; j < 5; j++) ellipse(ctx, px + Math.cos(j * 1.257) * 1.65, py + Math.sin(j * 1.257) * 1.65,
      1.7, 1.2, seed % 3 ? "#f2eed8" : "#d8bdd0", j * 1.257);
    ellipse(ctx, px, py, 1.1, 1.1, "#d0a453");
  }
}

export function paintFallenLog(ctx: Context, x: number, y: number, size: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15);
  ellipse(ctx, 3, 4, size * 1.05, size * 0.19, "#29432b35");
  const bark = ctx.createLinearGradient(0, -size * 0.26, 0, size * 0.2);
  bark.addColorStop(0, "#ad9267"); bark.addColorStop(0.4, "#82714e"); bark.addColorStop(1, "#504c35");
  ctx.fillStyle = bark;
  ctx.beginPath(); ctx.roundRect(-size, -size * 0.23, size * 2, size * 0.40, size * 0.12); ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = i % 2 ? "#e0c89645" : "#3e423155"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-size * 0.9, -size * 0.16 + i * size * 0.06);
    ctx.quadraticCurveTo(0, -size * 0.12 + i * size * 0.06, size * 0.9, -size * 0.15 + i * size * 0.06); ctx.stroke();
  }
  ellipse(ctx, size * 0.93, -size * 0.02, size * 0.12, size * 0.21, "#c3ac78");
  for (const r of [0.13, 0.075]) {
    ctx.strokeStyle = "#8c805653"; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.ellipse(size * 0.94, -size * 0.02, size * r * 0.5, size * r, 0, 0, Math.PI * 2); ctx.stroke();
  }
  for (let i = 0; i < 5; i++) ellipse(ctx, -size * 0.65 + i * size * 0.18, -size * 0.17, size * 0.14, size * 0.05, "#8ca05b9a");
  ctx.restore();
}
