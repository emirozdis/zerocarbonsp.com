import { randomFor } from "@/lib/forest/model";
import { ellipse, SCENE, type Context } from "./scene-theme";


export function paintAmbient(ctx: Context, w: number, h: number, time: number, health: number) {
  for (let i = 0; i < 8; i++) {
    const opacity = Math.max(0, Math.min(1, (health - i * 10) / 20));
    if (!opacity) continue;
    const x = w * (0.1 + randomFor(551, i) * 0.8) + Math.sin(time * 0.24 + i) * 18;
    const y = h * (0.45 + randomFor(740, i) * 0.4) + Math.cos(time * 0.39 + i * 2) * 10;
    ctx.save(); ctx.globalAlpha = opacity * 0.7;
    if (i % 3) ellipse(ctx, x, y, 1.4, 1.4, SCENE.light);
    else {
      const wing = 1.8 + Math.abs(Math.sin(time * 3 + i)) * 2;
      ellipse(ctx, x - 2.2, y, 2.5, wing, "#e2bd64", -0.4);
      ellipse(ctx, x + 2.2, y, 2.5, wing, "#f5da8b", 0.4);
      ellipse(ctx, x, y, 0.65, 2.5, "#817146");
    }
    ctx.restore();
  }
}
