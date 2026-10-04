import type { Bounds } from "@/lib/forest/tree-geometry";
export interface Camera { x: number; y: number; zoom: number }
export interface Point { x: number; y: number }
export function sceneOrigin(w: number, h: number, forest: boolean): Point {
  return forest ? { x: w / 2, y: h / 2 } : { x: w * (w > 760 ? 0.46 : 0.5), y: h * 0.79 };
}
export function zoomCamera(camera: Camera, factor: number, anchor: Point, forest: boolean): Camera {
  if (!Number.isFinite(factor) || factor <= 0) return camera;
  const zoom = Math.max(forest ? 0.35 : 0.4, Math.min(2.4, camera.zoom * factor));
  const ratio = zoom / camera.zoom;
  return { x: anchor.x + (camera.x - anchor.x) * ratio, y: anchor.y + (camera.y - anchor.y) * ratio, zoom };
}
export interface TreeHit { uid: string; left: number; top: number; right: number; bottom: number }
export function closeupFrame(w: number, h: number, bounds: Bounds, zoom = 1) {
  const base = Math.min(115, h * 0.145, w * 0.20);
  const originY = h * 0.79;
  const top = h > 420 ? 115 : 32;
  const width = w * (w > 760 ? 0.62 : 0.86);
  const scale = Math.min(base, (originY - top) / Math.max(0.2, -bounds.top), width / Math.max(0.25, bounds.right - bounds.left)) * zoom;
  return { ...sceneOrigin(w, h, false), scale };
}
export function worldBounds(bounds: Bounds, x: number, y: number, scale: number): Omit<TreeHit, "uid"> {
  return { left: x + bounds.left * scale, top: y + bounds.top * scale, right: x + bounds.right * scale, bottom: y + bounds.bottom * scale };
}
export function containsPoint(hit: Omit<TreeHit, "uid">, x: number, y: number) {
  return x >= hit.left - 8 && x <= hit.right + 8 && y >= hit.top - 8 && y <= hit.bottom + 8;
}
