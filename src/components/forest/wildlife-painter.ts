import type { Animal } from "@/lib/forest/landscape-model";
import { ellipse, type Context } from "./scene-theme";

function eye(ctx: Context, x: number, y: number) {
  ellipse(ctx, x, y, 0.9, 1.0, "#263028");
  ellipse(ctx, x - 0.2, y - 0.3, 0.24, 0.24, "#f2e8ca");
}
function rabbit(ctx: Context, phase: number) {
  const breathe = Math.sin(phase * 1.1) * 0.25;
  const ear = Math.sin(phase * 0.7) * 0.10;
  const fur = ctx.createLinearGradient(-12, -18, 14, 0);
  fur.addColorStop(0, "#c8bc9e"); fur.addColorStop(0.5, "#a49b80"); fur.addColorStop(1, "#837f68");
  ellipse(ctx, -10, -6, 4.4, 4.0, "#e4dcc3");
  ellipse(ctx, -1, -8 + breathe, 12.5, 9.4, fur, -0.12);
  ellipse(ctx, -4, -3, 7, 4, "#b7ab8f");
  ellipse(ctx, 4, -0.7, 6, 1.7, "#d0c2a3");
  ellipse(ctx, 9, -3, 2.2, 4.5, "#bbae91", -0.3);
  ctx.save(); ctx.translate(10, -15 + breathe); ctx.rotate(Math.sin(phase * 0.5) * 0.025);
  ellipse(ctx, -1.5, -11, 2.5, 10, "#b3a58a", -0.27 + ear);
  ellipse(ctx, 3, -10, 2.3, 9, "#d0c1a2", 0.10 + ear);
  ellipse(ctx, -1.5, -11, 1.0, 7.4, "#bda394", -0.27 + ear);
  ellipse(ctx, 3, -10, 0.9, 6.8, "#c2a69a", 0.10 + ear);
  ellipse(ctx, 0, 0, 6.3, 6.8, fur, -0.2);
  ellipse(ctx, 4.1, 3, 4.2, 3.0, "#d5cab0");
  eye(ctx, 3.1, -0.7);
  ellipse(ctx, 7.3, 2.5, 1.0, 0.7, "#8c7565");
  ctx.strokeStyle = "#ede2c56a"; ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(5, 3); ctx.lineTo(12, 1 + i * 2); ctx.stroke();
  }
  ctx.restore();
}
function squirrel(ctx: Context, phase: number) {
  ctx.save();
  ctx.rotate(Math.sin(phase * 0.6) * 0.025);
  const tail = ctx.createLinearGradient(-22, -25, -3, -1);
  tail.addColorStop(0, "#b78b5c"); tail.addColorStop(0.55, "#92704c"); tail.addColorStop(1, "#6c5940");
  ctx.fillStyle = tail;
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.bezierCurveTo(-29, 0, -28, -26, -17, -28);
  ctx.bezierCurveTo(-7, -30, -6, -19, -15, -17);
  ctx.bezierCurveTo(-19, -14, -12, -8, -3, -9);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#d9b48460"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-10, -3); ctx.bezierCurveTo(-26, -10, -24, -28, -15, -25); ctx.stroke();
  ctx.restore();
  ellipse(ctx, 0, -8, 7.5, 10, "#a48157", 0.23);
  ellipse(ctx, 4, -6, 3.8, 7, "#d4c3a0", 0.23);
  ellipse(ctx, -2, -3, 6, 3.5, "#8b714d");
  ellipse(ctx, 3, 0, 6, 1.5, "#745f43");
  ellipse(ctx, 7, -17, 6.2, 5.5, "#a7865a");
  ellipse(ctx, 5, -22, 2.0, 4.8, "#9d784e", -0.14);
  ellipse(ctx, 10.5, -14.5, 3.8, 2.4, "#d2bd96");
  eye(ctx, 9.5, -18);
  ellipse(ctx, 13.7, -15, 0.9, 0.8, "#473f30");
  ellipse(ctx, 9, -7, 3, 3.8, "#78633c");
  ellipse(ctx, 7, -9, 3.2, 1.4, "#bda078", -0.8);
}
function robin(ctx: Context, phase: number) {
  ctx.strokeStyle = "#64563b"; ctx.lineWidth = 0.7;
  for (const x of [-2, 3]) {
    ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x + 1, 0); ctx.lineTo(x + 4, 0.5); ctx.stroke();
  }
  ctx.fillStyle = "#5b6456";
  ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(-17, -12); ctx.lineTo(-14, -7); ctx.lineTo(-4, -5); ctx.fill();
  ellipse(ctx, 0, -10, 7.8, 6.5, "#818673", -0.22);
  ellipse(ctx, 4, -8, 4.8, 5.0, "#cc986b", -0.2);
  ellipse(ctx, -2, -11, 5.7, 3.6, "#656f61", -0.22);
  ctx.strokeStyle = "#b7baa050"; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-6, -11); ctx.lineTo(1, -9); ctx.moveTo(-5, -13); ctx.lineTo(1, -11); ctx.stroke();
  ctx.save(); ctx.translate(5, -16); ctx.rotate(Math.sin(phase * 0.9) * 0.10);
  ellipse(ctx, 0, 0, 4.8, 4.5, "#8b8c75");
  ellipse(ctx, 2.4, 1.7, 2.8, 2.8, "#d5a078");
  eye(ctx, 2.5, -1);
  ctx.fillStyle = "#665e46"; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(9, 1.1); ctx.lineTo(4, 2); ctx.fill();
  ctx.restore();
}
function duck(ctx: Context, phase: number, id: number) {
  const bob = Math.sin(phase * 1.4) * 0.45;
  ctx.save(); ctx.translate(0, bob);
  ctx.strokeStyle = "#e0edce80"; ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.5 - i * 0.12;
    ctx.beginPath(); ctx.ellipse(-5 - i * 8, 3, 13 + i * 5, 3 + i, 0, -0.7, 0.7); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ellipse(ctx, 0, 1, 14, 3.0, "#2b68653b");
  ctx.fillStyle = "#6e7362";
  ctx.beginPath(); ctx.moveTo(-8, -1); ctx.lineTo(-17, -7); ctx.lineTo(-13, 0); ctx.fill();
  const body = ctx.createLinearGradient(0, -11, 0, 1);
  body.addColorStop(0, "#d1cdb6"); body.addColorStop(1, "#928f78");
  ellipse(ctx, 0, -4, 12, 6.2, body);
  ellipse(ctx, -1, -6, 8.8, 3.8, "#8e9682", -0.10);
  ctx.strokeStyle = "#e0ddc176"; ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-7 + i * 3, -7); ctx.lineTo(-10 + i * 3, -3); ctx.stroke();
  }
  ellipse(ctx, 8, -10, 3.5, 7.1, id % 2 ? "#908871" : "#416d58", 0.15);
  ellipse(ctx, 10, -16, 5.1, 4.8, id % 2 ? "#aa9e7e" : "#497861");
  ctx.strokeStyle = "#ddd8b5"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(5, -8); ctx.lineTo(11, -8); ctx.stroke();
  ctx.fillStyle = "#c6a266";
  ctx.beginPath(); ctx.moveTo(13, -15); ctx.lineTo(21, -13.5); ctx.quadraticCurveTo(18, -11, 13, -12); ctx.fill();
  eye(ctx, 12, -17);
  ctx.restore();
}

/** Small profile illustrations use the same lighting and scale as the landscape. */
export function paintAnimal(ctx: Context, animal: Animal) {
  ctx.save();
  ctx.translate(animal.x, animal.y);
  ctx.scale(animal.scale * animal.facing, animal.scale);
  if (animal.kind !== "duck") ellipse(ctx, 2, 2, animal.kind === "robin" ? 10 : 17, 3.2, "#294a2d32");
  if (animal.kind === "rabbit") rabbit(ctx, animal.phase);
  else if (animal.kind === "squirrel") squirrel(ctx, animal.phase);
  else if (animal.kind === "robin") robin(ctx, animal.phase);
  else duck(ctx, animal.phase, animal.id);
  ctx.restore();
}
