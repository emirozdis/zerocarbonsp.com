import { ellipse, SCENE, type Context } from "./scene-theme";

const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

/** Screen-space labels stay readable while distances use the tree's metre scale. */
export function paintHeightReference(
  ctx: Context,
  { x, ground, height, pixelsPerMetre, top = 12 }: {
    x: number; ground: number; height: number; pixelsPerMetre: number; top?: number;
  },
) {
  const metres = Math.max(0, height);
  const markerY = ground - metres * pixelsPerMetre;
  // Choose familiar intervals and limit label density for both tall trees and zooming.
  const desiredStep = Math.max(metres / 6, 32 / pixelsPerMetre, 0.01);
  const magnitude = 10 ** Math.floor(Math.log10(desiredStep));
  const step = ([1, 2, 5, 10].find(value => value * magnitude >= desiredStep) ?? 10) * magnitude;
  const label = metres > 0 && metres < 1
    ? `${number.format(metres * 100)} cm` : `${number.format(metres)} m`;

  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#48644b";
  ctx.beginPath();
  ctx.moveTo(x, ground);
  ctx.lineTo(x, Math.max(top, markerY));
  ctx.stroke();
  ctx.font = "500 10px system-ui";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= Math.floor(metres / step); i++) {
    const value = i * step, y = ground - value * pixelsPerMetre;
    if (y < top || Math.abs(y - markerY) < 20) continue;
    ctx.strokeStyle = "#48644b";
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 6, y); ctx.stroke();
    const text = value > 0 && value < 1 ? `${number.format(value * 100)} cm` : `${number.format(value)} m`;
    ctx.strokeStyle = "#f4ecd9"; ctx.lineWidth = 3;
    ctx.strokeText(text, x - 9, y);
    ctx.fillStyle = SCENE.ink; ctx.fillText(text, x - 9, y);
    ctx.lineWidth = 1.5;
  }
  // Follow the animated height, independently of the cached terrain.
  const badgeY = Math.max(top + 12, markerY);
  ctx.font = "600 12px system-ui";
  const width = ctx.measureText(label).width + 20;
  ctx.fillStyle = "#f4ecd9";
  ctx.beginPath(); ctx.roundRect(x - width / 2, badgeY - 12, width, 24, 6); ctx.fill();
  ctx.fillStyle = SCENE.ink;
  ctx.textAlign = "center";
  ctx.fillText(label, x, badgeY);
  if (markerY < top) {
    // An upward chevron identifies a treetop above the viewport at high zoom.
    ctx.strokeStyle = SCENE.ink;
    ctx.beginPath(); ctx.moveTo(x - 4, top + 3); ctx.lineTo(x, top - 1); ctx.lineTo(x + 4, top + 3); ctx.stroke();
  }
  ellipse(ctx, x, ground + 2, 5, 2, "#48644b60");
  ctx.restore();
}
