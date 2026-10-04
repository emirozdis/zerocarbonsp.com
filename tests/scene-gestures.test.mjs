import test from "node:test";
import assert from "node:assert/strict";
import { bindSceneGestures } from "../src/components/forest/scene-gestures.ts";
import { sceneOrigin, zoomCamera } from "../src/components/forest/scene-camera.ts";

class Surface extends EventTarget {
  captures = new Set();
  getBoundingClientRect() { return { left: 30, top: 50, width: 800, height: 500 }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  emit(type, values = {}) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { pointerId: 1, button: 0, clientX: 330, clientY: 250, deltaY: 0, deltaMode: 0, ctrlKey: false }, values);
    this.dispatchEvent(event);
    return event;
  }
}
function setup(forest = true) {
  const surface = new Surface(), camera = { current: { x: 0, y: 0, zoom: 1 } }, taps = [];
  let frames = 0;
  const cleanup = bindSceneGestures(surface, { forest, camera, onTap: point => taps.push(point), invalidate: () => frames++ });
  return { surface, camera, taps, cleanup, frames: () => frames };
}
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("zoom preserves its anchor in both previews and clamps without drifting", () => {
  for (const forest of [false, true]) {
    const camera = { x: 35, y: -20, zoom: 1 }, anchor = { x: 130, y: -90 };
    const zoomed = zoomCamera(camera, 2, anchor, forest);
    near((anchor.x - camera.x) / camera.zoom, (anchor.x - zoomed.x) / zoomed.zoom);
    near((anchor.y - camera.y) / camera.zoom, (anchor.y - zoomed.y) / zoomed.zoom);
    const limit = zoomCamera(zoomed, 100, anchor, forest);
    assert.equal(limit.zoom, 2.4);
    assert.deepEqual(zoomCamera(limit, 2, anchor, forest), limit);
    assert.equal(zoomCamera(camera, 0.001, anchor, forest).zoom, forest ? 0.35 : 0.4);
    assert.deepEqual(zoomCamera(camera, NaN, anchor, forest), camera);
  }
});

test("wheel and trackpad zoom stay local to each preview and normalize wheel units", () => {
  for (const forest of [false, true]) {
    const { surface, camera, cleanup, frames } = setup(forest);
    const origin = sceneOrigin(800, 500, forest);
    assert.equal(surface.emit("wheel", { deltaY: -20, ctrlKey: true }).defaultPrevented, true);
    assert.ok(camera.current.zoom > 1);
    near((300 - origin.x - camera.current.x) / camera.current.zoom, 300 - origin.x);
    surface.emit("wheel", { deltaY: 20, ctrlKey: true });
    near(camera.current.zoom, 1);
    surface.emit("wheel", { deltaY: 1, deltaMode: 1 });
    near(camera.current.zoom, Math.exp(-16 * 0.002));
    surface.emit("wheel", { deltaY: -16 });
    near(camera.current.zoom, 1);
    cleanup();
    const previous = frames();
    assert.equal(surface.emit("wheel", { deltaY: -100 }).defaultPrevented, false);
    assert.equal(frames(), previous);
  }
});

test("two fingers zoom both previews, preserve the midpoint, and never select a tree", () => {
  for (const forest of [false, true]) {
    const { surface, camera, taps, cleanup } = setup(forest);
    surface.emit("pointerdown", { clientX: 230 });
    surface.emit("pointerdown", { pointerId: 2, clientX: 430 });
    surface.emit("pointermove", { pointerId: 2, clientX: 630 });
    near(camera.current.zoom, 2);
    const origin = sceneOrigin(800, 500, forest);
    near((400 - origin.x - camera.current.x) / 2, 300 - origin.x);
    surface.emit("pointerup", { pointerId: 2, clientX: 630 });
    surface.emit("pointermove", { clientX: 240 });
    surface.emit("pointerup", { clientX: 240 });
    assert.deepEqual(taps, []);
    cleanup();
    assert.equal(surface.captures.size, 0);
  }
});

test("forest taps still select, while dragging and cancelled capture do not", () => {
  const { surface, camera, taps } = setup();
  surface.emit("pointerdown");
  surface.emit("pointerup");
  assert.deepEqual(taps, [{ x: 300, y: 200 }]);
  surface.emit("pointerdown");
  surface.emit("pointermove", { clientX: 360 });
  surface.emit("pointerup", { clientX: 360 });
  assert.equal(camera.current.x, 30);
  for (const type of ["pointercancel", "lostpointercapture"]) {
    surface.emit("pointerdown");
    surface.emit(type);
    surface.emit("pointermove", { clientX: 500 });
    surface.emit("pointerup");
  }
  assert.equal(taps.length, 1);
  assert.equal(camera.current.x, 30);
});

test("Safari scale gestures zoom once and reset between gestures", () => {
  const { surface, camera } = setup(false);
  surface.emit("gesturestart", { scale: 1 });
  surface.emit("gesturechange", { scale: 1.5 });
  surface.emit("wheel", { deltaY: -20, ctrlKey: true });
  near(camera.current.zoom, 1.5);
  surface.emit("gesturechange", { scale: 1.2 });
  near(camera.current.zoom, 1.2);
  surface.emit("gestureend", { scale: 1.2 });
  surface.emit("gesturestart", { scale: 1 });
  surface.emit("gesturechange", { scale: 0.5 });
  near(camera.current.zoom, 0.6);
});
