"use client";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Play, Pause, RotateCcw, Sprout, Leaf, Heart, ArrowUpRight } from "lucide-react";
import { GROWTH_STAGES, growthPosition, growthStage, timelineGrowth } from "@/lib/forest/growth-profile";

export interface PreviewState { growth: number; health: number; scrubbing: boolean }
export function GrowthPreviewControls({ value, base, onChange, onMeal }: {
  value: PreviewState | null;
  base: { growth: number; health: number };
  onChange: Dispatch<SetStateAction<PreviewState | null>>;
  onMeal: (weight: number | null) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const playhead = useRef(0);
  const shown = value ?? base;
  const stage = growthStage(shown.growth);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      playhead.current = Math.min(1, playhead.current + 0.004);
      onChange(previous => ({ growth: timelineGrowth(playhead.current), health: previous?.health ?? 100, scrubbing: true }));
      if (playhead.current >= 1) setPlaying(false);
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, onChange]);
  function scrub(growth: number) {
    setPlaying(false);
    onChange({ growth, health: shown.health, scrubbing: true });
  }
  function meal(weight: number | null) {
    setPlaying(false); onChange(null); onMeal(weight);
  }
  return <section className="growth-explorer" aria-label="Büyüme önizlemesi">
    <div className="growth-explorer-heading">
      <div><span className="section-eyebrow">BİR TOHUMDAN BİR DÜNYAYA</span><h2>Büyümeyi keşfet.</h2></div>
      <span className={`explorer-mode ${value ? "is-illustration" : ""}`}><span />{value ? "Temsili görünüm" : "Öğün önizlemesi"}</span>
    </div>
    <div className="growth-playback">
      <button className="growth-play" aria-label={playing ? "Büyümeyi duraklat" : "Büyümeyi oynat"} onClick={() => {
        if (playing) { setPlaying(false); return; }
        playhead.current = value && growthPosition(value.growth) < 1 ? growthPosition(value.growth) : 0;
        onChange({ growth: timelineGrowth(playhead.current), health: shown.health, scrubbing: true });
        setPlaying(true);
      }}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
      <div className="growth-track">
        <label htmlFor="growth-preview-slider"><strong>{stage.label}</strong><span>{stage.detail}</span></label>
        <input id="growth-preview-slider" type="range" min="0" max="1000" step="1" value={Math.round(growthPosition(shown.growth) * 1000)} onChange={e => scrub(timelineGrowth(Number(e.target.value) / 1000))} aria-valuetext={`${stage.label}, ${shown.growth.toFixed(1)} büyüme puanı`} />
      </div>
      <button className="growth-reset" aria-label="Önizlemeyi sıfırla" title="Önizlemeyi sıfırla" onClick={() => meal(null)}><RotateCcw size={17} /></button>
    </div>
    <div className="growth-stage-list" aria-label="Büyüme aşamaları">
      {GROWTH_STAGES.map((item, i) => <button key={item.label} aria-pressed={stage.index === i} onClick={() => scrub(item.sample)}><span>{String(i + 1).padStart(2, "0")}</span>{item.label}</button>)}
    </div>
    <div className="growth-experiments">
      <div className="growth-health"><label htmlFor="preview-health"><Heart size={14} /> Canlılık <strong>%{Math.round(shown.health)}</strong></label><input id="preview-health" type="range" min="15" max="100" value={shown.health} onChange={e => { setPlaying(false); onChange({ growth: shown.growth, health: Number(e.target.value), scrubbing: false }); }} /><button onClick={() => { setPlaying(false); onChange({ growth: shown.growth, health: shown.health > 55 ? 30 : 100, scrubbing: false }); }}>{shown.health > 55 ? "Dinlenmeye ihtiyacı var" : "Toparlanmasını izle"}<ArrowUpRight size={13} /></button></div>
      <div className="growth-meals"><span>BİR ÖĞÜNÜ DENE</span><button onClick={() => meal(0)}><Sprout size={15} /> İsrafsız öğün</button><button onClick={() => meal(240)}><Leaf size={15} /> İsraflı öğün</button></div>
    </div>
    <p className="growth-disclaimer">{value ? "Bu görünüm ağacın yaşam döngüsünü gösterir. Gerçek öğün, yaş veya çevresel tasarruf kaydı oluşturmaz." : "Örnek bir ağacı keşfediyorsun. Kendi ağacın, okulda kaydedilen öğünlerinle büyür."}</p>
  </section>;
}
