import { sceneOrigin, zoomCamera, type Camera, type Point } from "./scene-camera.ts";

interface GestureOptions {
  forest: boolean;
  camera: { current: Camera };
  invalidate: () => void;
  onTap: (point: Point) => void;
}
interface TrackedPointer extends Point { start: Point; moved: boolean }
interface ScaleGesture extends Event { scale: number; clientX: number; clientY: number }

// Own only gestures that start on this surface; return cleanup for remounts.
export function bindSceneGestures(element: HTMLCanvasElement, options: GestureOptions) {
  const { camera, forest, invalidate, onTap } = options;
  const pointers = new Map<number, TrackedPointer>();
  let gestureScale: number | null = null;
  const point = (event: { clientX: number; clientY: number }): Point => {
    const rect = element.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  function zoom(factor: number, at: Point, from = at) {
    const rect = element.getBoundingClientRect();
    const origin = sceneOrigin(rect.width, rect.height, forest);
    camera.current = zoomCamera(camera.current, factor, { x: from.x - origin.x, y: from.y - origin.y }, forest);
    camera.current.x += at.x - from.x;
    camera.current.y += at.y - from.y;
    invalidate();
  }
  function wheel(event: WheelEvent) {
    event.preventDefault();
    if (gestureScale !== null || pointers.size > 1) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.getBoundingClientRect().height : 1;
    const delta = Math.max(-100, Math.min(100, event.deltaY * unit));
    zoom(Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.002)), point(event));
  }
  function down(event: PointerEvent) {
    if (event.button !== 0) return;
    const at = point(event);
    pointers.set(event.pointerId, { ...at, start: at, moved: false });
    element.setPointerCapture(event.pointerId);
    if (pointers.size > 1) for (const pointer of pointers.values()) pointer.moved = true;
  }
  function move(event: PointerEvent) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    const at = point(event);
    const pair = [...pointers.values()].slice(0, 2);
    const midpoint = () => ({ x: (pair[0].x + pair[1].x) / 2, y: (pair[0].y + pair[1].y) / 2 });
    const distance = () => Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
    if (pair.length === 2 && pair.includes(pointer)) {
      const before = midpoint(), separation = distance();
      Object.assign(pointer, at);
      const nextSeparation = distance();
      zoom(separation > 0 && nextSeparation > 0 ? nextSeparation / separation : 1, midpoint(), before);
    } else {
      const moved = pointer.moved || Math.hypot(at.x - pointer.start.x, at.y - pointer.start.y) > 5;
      if (forest && pointers.size === 1 && moved) {
        camera.current.x += at.x - pointer.x;
        camera.current.y += at.y - pointer.y;
        invalidate();
      }
      pointer.moved = moved;
      Object.assign(pointer, at);
    }
  }
  function end(event: PointerEvent) {
    const pointer = pointers.get(event.pointerId);
    pointers.delete(event.pointerId);
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    if (event.type === "pointerup" && forest && pointer && !pointer.moved) {
      const at = point(event);
      if (Math.hypot(at.x - pointer.start.x, at.y - pointer.start.y) <= 5) onTap(at);
    }
  }
  // Safari exposes trackpad pinches as gesture events instead of ctrl+wheel.
  function gesture(event: Event) {
    event.preventDefault();
    const e = event as ScaleGesture;
    if (e.type === "gestureend") { gestureScale = null; return; }
    for (const pointer of pointers.values()) pointer.moved = true;
    if (e.type === "gesturechange" && gestureScale !== null && pointers.size < 2) zoom(e.scale / gestureScale, point(e));
    gestureScale = e.scale;
  }
  element.addEventListener("wheel", wheel, { passive: false });
  element.addEventListener("pointerdown", down);
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
  element.addEventListener("lostpointercapture", end);
  for (const type of ["gesturestart", "gesturechange", "gestureend"]) element.addEventListener(type, gesture, { passive: false });
  return () => {
    element.removeEventListener("wheel", wheel);
    element.removeEventListener("pointerdown", down);
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", end);
    element.removeEventListener("pointercancel", end);
    element.removeEventListener("lostpointercapture", end);
    for (const type of ["gesturestart", "gesturechange", "gestureend"]) element.removeEventListener(type, gesture);
    for (const id of pointers.keys()) if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    pointers.clear();
  };
}
