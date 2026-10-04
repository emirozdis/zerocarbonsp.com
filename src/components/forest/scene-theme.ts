import { clamp01 } from "@/lib/forest/growth-profile";
export type Context = CanvasRenderingContext2D;
export const SCENE = {
  sky: "#c6d4d1", meadow: "#87915d", gravel: "#b6a17c",
  mist: "#d4dbc9", soil: "#65513a", soilLight: "#a58d5d",
  grass: "#627849", light: "#f5e5a3", ink: "#294935",
};
export function ellipse(ctx: Context, x: number, y: number, rx: number, ry: number, color: string | CanvasGradient, angle = 0) {
  if (rx <= 0 || ry <= 0) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill();
}
export function leafColor(health: number, tone: number, rear = false) {
  const vitality = clamp01(health / 100);
  return `hsl(${52 + vitality * 44 + tone * 8} ${26 + vitality * 13}% ${24 + tone * 27 - (rear ? 7 : 0)}%)`;
}
/** Pointed, folded leaf with a lit face and optional midrib. */
export function paintLeaf(ctx: Context, x: number, y: number, length: number, angle: number, color: string, detail: number) {
  if (length < 0.015) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-length * 0.56, -length * 0.3, -length * 0.35, -length * 0.83, 0, -length);
  ctx.bezierCurveTo(length * 0.50, -length * 0.65, length * 0.40, -length * 0.14, 0, 0);
  ctx.fill();
  if (detail > 0) {
    ctx.globalAlpha *= detail;
    ctx.fillStyle = "#e0e8a32a";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-length * 0.56, -length * 0.3, -length * 0.35, -length * 0.83, 0, -length);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#e2e7af55";
    ctx.lineWidth = Math.max(0.35, length * 0.025);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-length * 0.08, -length * 0.4, 0, -length * 0.86);
    ctx.stroke();
  }
  ctx.restore();
}
