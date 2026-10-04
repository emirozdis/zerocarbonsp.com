"use client";
import { studentDisplayName } from "@/lib/forest/student-label";
import { useEffect, useRef, useState } from "react";
import type { Plant } from "@/lib/forest/model";
import { plantDimensions } from "@/lib/forest/growth-profile";
import { createTreeGeometry, type TreeGeometry } from "@/lib/forest/tree-geometry";
import { retargetTransition, sampleTransition, type VisualTransition } from "@/lib/forest/visual-transition";
import { paintTree, plotPosition } from "./tree-painter";
import { paintAmbient } from "./environment-painter";
import { createLandscapePainter } from "./landscape-painter";
import { paintHeightReference } from "./height-reference";
import { closeupFrame, worldBounds, type Camera, type TreeHit } from "./scene-camera";
import { ellipse } from "./scene-theme";
import { wildlifeFrame, type TerrainBounds } from "@/lib/forest/landscape-model";
import { paintAnimal } from "./wildlife-painter";
import { paintWaterMotion } from "./water-painter";

interface SceneState { plants: Plant[]; focus?: Plant | null; health: number; immediate: boolean }
interface Sprite { key: string; canvas: HTMLCanvasElement; geometry: TreeGeometry; scale: number; padding: number }
export function useWorldRenderer({ plants, focus, health, immediate }: SceneState, forest: boolean) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const camera = useRef<Camera>({ x: 0, y: 0, zoom: forest ? 0.85 : 1 });
  const hits = useRef<TreeHit[]>([]);
  const latest = useRef({ plants, focus, health, immediate });
  const transitions = useRef(new Map<string, VisualTransition>());
  const invalidate = useRef<() => void>(() => {});
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    latest.current = { focus, health, immediate, plants: [...plants].sort((a, b) => plotPosition(a).y - plotPosition(b).y) };
    const now = performance.now();
    const next = new Map<string, VisualTransition>();
    for (const plant of plants) next.set(plant.uid, retargetTransition(transitions.current.get(plant.uid), plant, now, immediate));
    if (focus && !next.has(focus.uid)) next.set(focus.uid, retargetTransition(transitions.current.get(focus.uid), focus, now, immediate));
    transitions.current = next;
    invalidate.current();
  }, [plants, focus, health, immediate]);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) { setUnsupported(true); return; }
    let frame = 0, previous = 0, visible = true, dirty = true;
    let w = 0, h = 0, dpr = 1, backgroundKey = "";
    const background = document.createElement("canvas");
    const bg = background.getContext("2d")!;
    const landscape = createLandscapePainter(bg);
    const sprites = new Map<string, Sprite>();
    const geometries = new Map<string, { growth: number; seed: number; tree: TreeGeometry }>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = () => visible && !document.hidden;
    function schedule() {
      dirty = true;
      if (!frame && active()) frame = requestAnimationFrame(draw);
    }
    invalidate.current = schedule;
    function resize() {
      const rect = el!.getBoundingClientRect();
      w = rect.width; h = rect.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      el!.width = Math.round(w * dpr); el!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      backgroundKey = "";
      schedule();
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const io = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (active()) schedule(); else { cancelAnimationFrame(frame); frame = 0; }
    }); io.observe(el);
    const visibility = () => { if (active()) schedule(); else { cancelAnimationFrame(frame); frame = 0; } };
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", schedule);
    const geometryFor = (plant: Plant) => {
      const cached = geometries.get(plant.uid);
      if (cached?.growth === plant.growth && cached.seed === plant.seed) return cached.tree;
      const tree = createTreeGeometry(plant.seed, plant.growth);
      if (geometries.size >= 96) geometries.delete(geometries.keys().next().value!);
      geometries.set(plant.uid, { growth: plant.growth, seed: plant.seed, tree });
      return tree;
    };
    function spriteFor(plant: Plant, tree: TreeGeometry, scale: number) {
      const key = `${plant.seed}/${plant.growth}/${plant.health}/${scale}`;
      const existing = sprites.get(plant.uid);
      if (existing?.key === key) return existing;
      const padding = 8, resolution = 2;
      const c = document.createElement("canvas");
      c.width = Math.ceil((tree.bounds.right - tree.bounds.left) * scale * resolution + padding * 2);
      c.height = Math.ceil((tree.bounds.bottom - tree.bounds.top) * scale * resolution + padding * 2);
      const cctx = c.getContext("2d")!;
      paintTree(cctx, plant, -tree.bounds.left * scale * resolution + padding, -tree.bounds.top * scale * resolution + padding, scale * resolution, 0, 0.65, tree);
      const sprite = { key, canvas: c, geometry: tree, scale, padding };
      if (sprites.size >= 64) sprites.delete(sprites.keys().next().value!);
      sprites.set(plant.uid, sprite);
      return sprite;
    }
    function draw(now: number) {
      frame = 0;
      if (!active() || !w || !h || !ctx) return;
      if (!reduced.matches && !dirty && now - previous < 1000 / 40) { frame = requestAnimationFrame(draw); return; }
      previous = now; dirty = false;
      const current = latest.current;
      const time = reduced.matches ? 0 : now / 1000;
      const animated = (plant: Plant) => {
        const transition = transitions.current.get(plant.uid);
        return !transition || reduced.matches ? plant : sampleTransition(transition, now);
      };
      const focusedPlant = current.focus ? animated(current.focus) : null;
      const focusedTree = focusedPlant ? geometryFor(focusedPlant) : null;
      const gardenFrame = closeupFrame(w, h, focusedTree?.bounds ?? { left: -1, right: 1, top: -3, bottom: 0 }, camera.current.zoom);
      gardenFrame.x += camera.current.x;
      gardenFrame.y += camera.current.y;
      const sceneScale = forest ? camera.current.zoom : gardenFrame.scale / 100;
      const sceneX = forest ? w / 2 + camera.current.x : gardenFrame.x;
      const sceneY = forest ? h / 2 + camera.current.y : gardenFrame.y;
      const terrainBounds: TerrainBounds = {
        left: -sceneX / sceneScale,
        top: -sceneY / sceneScale,
        right: (w - sceneX) / sceneScale,
        bottom: (h - sceneY) / sceneScale,
      };
      const kind = forest ? "forest" : "garden";
      const key = `${w}/${h}/${forest}/${sceneX}/${sceneY}/${sceneScale}`;
      if (backgroundKey !== key) {
        background.width = Math.round(w * dpr); background.height = Math.round(h * dpr);
        bg.setTransform(dpr, 0, 0, dpr, 0, 0);
        bg.save(); bg.translate(sceneX, sceneY); bg.scale(sceneScale, sceneScale);
        if (forest) landscape.forest(terrainBounds, sceneScale);
        else landscape.garden(terrainBounds, sceneScale);
        bg.restore();
        backgroundKey = key;
      }
      ctx.clearRect(0, 0, w, h); ctx.drawImage(background, 0, 0, w, h);
      ctx.save(); ctx.translate(sceneX, sceneY); ctx.scale(sceneScale, sceneScale);
      paintWaterMotion(ctx, terrainBounds, kind, time);
      ctx.restore();
      const animals = wildlifeFrame(kind, time, terrainBounds);
      let animalIndex = 0;
      hits.current = [];
      if (forest) {
        const cam = camera.current;
        const ox = w / 2 + cam.x, oy = h / 2 + cam.y;
        ctx.save(); ctx.translate(ox, oy); ctx.scale(cam.zoom, cam.zoom);
        for (const source of current.plants) {
          const pos = plotPosition(source);
          const plant = animated(source);
          const scale = 42 / (1 + Math.log1p(plant.growth / 70) * 0.7);
          // Conservative dimensions cull before building detailed geometry or sprites.
          const dimensions = plantDimensions(plant.growth);
          const px = ox + pos.x * cam.zoom, py = oy + pos.y * cam.zoom;
          const extent = Math.max(14, dimensions.width * scale * cam.zoom);
          if (px + extent < 0 || px - extent > w || py + 25 * cam.zoom < 0 || py - dimensions.height * scale * cam.zoom * 1.5 > h) continue;
          // Merge wildlife with tree bases so animals pass behind the correct trees.
          while (animalIndex < animals.length && animals[animalIndex].y <= pos.y) {
            paintAnimal(ctx, animals[animalIndex++]);
          }
          if (plant.uid === current.focus?.uid) {
            ellipse(ctx, pos.x, pos.y + 2, 28, 10, "#f1d79735");
            ctx.strokeStyle = "#bfa467"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(pos.x, pos.y + 2, 28, 10, 0, 0, Math.PI * 2); ctx.stroke();
          }
          const tree = geometryFor(plant);
          const shadowWidth = Math.max(6, dimensions.width * scale * 0.43);
          ellipse(ctx, pos.x + shadowWidth * 0.3, pos.y + 3, shadowWidth, Math.max(3, shadowWidth * 0.2), "#3a522d22", 0.12);
          const transition = transitions.current.get(plant.uid);
          if (transition && now < transition.start + transition.duration && !reduced.matches) {
            paintTree(ctx, plant, pos.x, pos.y, scale, time, 0.35, tree);
          } else {
            const sprite = spriteFor(plant, tree, scale);
            const sway = Math.sin(time * 0.7 + plant.seed % 19) * 0.006;
            ctx.save(); ctx.translate(pos.x, pos.y); ctx.transform(1, 0, sway, 1, 0, 0);
            ctx.drawImage(sprite.canvas, tree.bounds.left * scale - sprite.padding / 2, tree.bounds.top * scale - sprite.padding / 2, sprite.canvas.width / 2, sprite.canvas.height / 2);
            ctx.restore();
          }
          hits.current.push({ uid: plant.uid, ...worldBounds(tree.bounds, px, py, scale * cam.zoom) });
          if (cam.zoom > 0.88 || source.uid === current.focus?.uid) {
            ctx.font = "500 10px system-ui"; ctx.textAlign = "center";
            const label = studentDisplayName(plant.name);
            const width = ctx.measureText(label).width + 14;
            ctx.fillStyle = "#f4f4e5df";
            ctx.beginPath(); ctx.roundRect(pos.x - width / 2, pos.y + 12, width, 18, 7); ctx.fill();
            ctx.fillStyle = "#49603e"; ctx.fillText(label, pos.x, pos.y + 24);
          }
        }
        while (animalIndex < animals.length) paintAnimal(ctx, animals[animalIndex++]);
        ctx.restore();
      } else if (focusedPlant && focusedTree) {
        const plant = focusedPlant, tree = focusedTree;
        const frame = gardenFrame;
        ctx.save(); ctx.translate(sceneX, sceneY); ctx.scale(sceneScale, sceneScale);
        while (animalIndex < animals.length && animals[animalIndex].y <= 0) paintAnimal(ctx, animals[animalIndex++]);
        ctx.restore();
        const canopy = Math.max(10, tree.profile.width * frame.scale * 0.45);
        const shadow = ctx.createRadialGradient(frame.x + 20, frame.y + 8, 0, frame.x + 20, frame.y + 8, canopy);
        shadow.addColorStop(0, "#29472938"); shadow.addColorStop(1, "#29472900");
        ellipse(ctx, frame.x + canopy * 0.35, frame.y + 10, canopy, Math.max(4, canopy * 0.2), shadow, 0.12);
        paintTree(ctx, plant, frame.x, frame.y, frame.scale, time, 1, tree);
        paintHeightReference(ctx, {
          x: Math.max(45, frame.x + Math.min(-1.05, tree.bounds.left - 0.25) * frame.scale),
          ground: frame.y, height: plant.height, pixelsPerMetre: frame.scale,
        });
        ctx.save(); ctx.translate(sceneX, sceneY); ctx.scale(sceneScale, sceneScale);
        while (animalIndex < animals.length) paintAnimal(ctx, animals[animalIndex++]);
        ctx.restore();
      }
      ctx.save();
      if (!forest) {
        const scale = gardenFrame.scale / 100;
        ctx.translate(gardenFrame.x - 250 * scale, gardenFrame.y - 360 * scale);
        ctx.scale(scale, scale);
      }
      paintAmbient(ctx, forest ? w : 500, forest ? h : 400, time, focusedPlant && !forest ? focusedPlant.health : current.health);
      ctx.restore();
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    }
    schedule();
    return () => {
      cancelAnimationFrame(frame); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", visibility); reduced.removeEventListener("change", schedule);
      sprites.clear(); geometries.clear(); invalidate.current = () => {};
    };
  }, [forest]);
  return { canvas, camera, hits, unsupported, invalidate };
}
