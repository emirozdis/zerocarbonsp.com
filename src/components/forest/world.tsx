"use client";
import { useEffect, useRef } from "react";
import { Minus, Plus, LocateFixed } from "lucide-react";
import type { Plant } from "@/lib/forest/model";
import { growthStage } from "@/lib/forest/growth-profile";
import { plotPosition } from "./tree-painter";
import { containsPoint, zoomCamera, type Point } from "./scene-camera";
import { bindSceneGestures } from "./scene-gestures";
import { useWorldRenderer } from "./use-world-renderer";

export function World({ plants, focus, forest = false, health = 80, immediate = false, onSelect }: {
  plants: Plant[]; focus?: Plant | null; forest?: boolean; health?: number;
  immediate?: boolean; onSelect?: (plant: Plant) => void;
}) {
  const { canvas, camera, hits, unsupported, invalidate } = useWorldRenderer({ plants, focus, health, immediate }, forest);
  const selection = useRef({ plants, onSelect });
  useEffect(() => { selection.current = { plants, onSelect }; }, [plants, onSelect]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    return bindSceneGestures(element, {
      forest, camera, invalidate: () => invalidate.current(),
      onTap: ({ x, y }: Point) => {
        const hit = [...hits.current].reverse().find(p => containsPoint(p, x, y));
        const plant = hit && selection.current.plants.find(p => p.uid === hit.uid);
        if (plant) selection.current.onSelect?.(plant);
      },
    });
  }, [canvas, camera, forest, hits, invalidate]);
  function zoom(factor: number) {
    camera.current = zoomCamera(camera.current, factor, { x: 0, y: 0 }, forest);
    invalidate.current();
  }
  function locate() {
    const pos = forest && focus ? plotPosition(focus) : { x: 0, y: 0 };
    camera.current = { x: -pos.x, y: -pos.y + (forest ? 65 : 0), zoom: 1 };
    invalidate.current();
  }
  return <div className={`world ${forest ? "world-map" : "world-garden"}`}>
    <canvas ref={canvas} role="img"
      aria-label={forest ? "Deresi, kayaları ve küçük hayvanlarıyla okul ormanı. Aşağıdaki listeden de ağaç seçebilirsin." : `${focus?.name || ""}: ${growthStage(focus?.growth ?? 0).label}, canlılık yüzde ${Math.round(focus?.health ?? 80)}. Dere, doğal bitki örtüsü ve küçük hayvanlarla yaşayan bir bahçe.`}
     />
    {unsupported && <div className="world-fallback">Ağaç görünümü bu cihazda desteklenmiyor. Tüm gelişim bilgilerin aşağıda.</div>}
    <div className="scene-atmosphere" aria-hidden="true"><span /> SAKİN BİR GÜN <span className="atmosphere-divider">/</span> YAŞAYAN ORMAN</div>
    <div className="map-controls">
      <button aria-label="Yakınlaştır" title="Yakınlaştır" onClick={() => zoom(1.2)}><Plus size={18} /></button>
      <button aria-label="Uzaklaştır" title="Uzaklaştır" onClick={() => zoom(1 / 1.2)}><Minus size={18} /></button>
      <button aria-label={forest ? "Ağacımı bul" : "Görünümü sıfırla"} title={forest ? "Ağacımı bul" : "Görünümü sıfırla"} onClick={locate}><LocateFixed size={18} /></button>
    </div>
  </div>;
}
