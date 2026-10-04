"use client";
import { studentDisplayName } from "@/lib/forest/student-label";
import { useMemo, useState } from "react";
import {
  Sprout,
  Trees,
  Search,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { SceneContent } from "@/components/ui/scene-content";
import { useForest } from "./provider";
import { World } from "./world";
import { PlantStats, Vitality, ImpactStats } from "./stats";
import { TreeVisit } from "./tree-visit";
import { MealHistory } from "./meal-history";
import { Milestones } from "./milestones";
import { GrowthProgress } from "./growth-progress";
import { GrowthPreviewControls, type PreviewState } from "./growth-preview-controls";
import { growthStage, plantDimensions } from "@/lib/forest/growth-profile";
export type View = "plant" | "forest";
export function Dashboard({ view }: { view: View }) {
  const { data, error, refresh, previewMeal } = useForest();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const illustrative = !!data?.demo && preview !== null;
  const displayed = useMemo(() => {
    if (!data?.me) return null;
    if (!data.demo || !preview) return data.me;
    return { ...data.me, growth: preview.growth, health: preview.health, ...plantDimensions(preview.growth), stage: growthStage(preview.growth).label };
  }, [data, preview]);
  const scenePlants = useMemo(() => view === "plant" && displayed ? [displayed] : data?.plants ?? [], [view, displayed, data]);
  if (!data)
    return (
      <main className="forest-container">
        <div className="forest-loading">
          <Sprout size={36} />
          <h1>{error ? "Ormana ulaşamadık." : "Yükleniyor…"}</h1>
          {error && (
            <button className="forest-button" onClick={() => void refresh()}>
              Tekrar dene
            </button>
          )}
        </div>
      </main>
    );
  const { me, summary, plants, history, demo, school } = data;
  const selected = plants.find((p) => p.uid === selectedId);
  const filtered = plants.filter((p) =>
    p.name.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")),
  );
  return (
    <main className={`forest-container scene-page ${view}-page`}>
      {error && (
        <div className="forest-error" role="alert">
          {error} <button onClick={() => void refresh()}>Yenile</button>
        </div>
      )}
      <section
        className={`immersive-scene ${view === "forest" ? "immersive-forest" : "immersive-garden"}`}
        aria-label={view === "plant" ? "Fidanım" : "Ormanımız"}
      >
        <World
          key={`${view}-${school.id}`}
          forest={view === "forest"}
          plants={scenePlants}
          focus={displayed}
          health={view === "plant" ? displayed?.health : summary.health}
          immediate={illustrative && !!preview?.scrubbing}
          onSelect={(p) => setSelectedId(p.uid)}
        />
        <div className="scene-heading">
          <h1>
            {view === "plant"
              ? `${(me ? studentDisplayName(me.name) : "Sen")}’in fidanı`
              : "Ormanımız"}
          </h1>
          <div className="scene-heading-meta">
            <span>{view === "plant" ? growthStage(displayed?.growth ?? 0).label : school.name}</span>
            {demo && <span className="preview-pill">Önizleme</span>}
          </div>
        </div>
        {view === "plant" && displayed ? (
          <>
            <aside className="floating-plant-info">
              <span className="plant-card-eyebrow">{illustrative ? "YAŞAM DÖNGÜSÜ" : "SENİN AĞACIN"}</span>
              {illustrative ? <div className="illustrated-stage"><strong>{growthStage(displayed.growth).label}</strong><p>{growthStage(displayed.growth).detail}</p></div> : <PlantStats plant={displayed} />}
              <Vitality health={displayed.health} />
              <Link href="/forest" className="scene-link">
                Ormandaki yerim <ArrowUpRight size={16} />
              </Link>
            </aside>

          </>
        ) : (
          <>
            <div className="floating-forest-info">
              <span>
                <Trees size={16} />
                {plants.length} ağaç
              </span>
              <Vitality health={summary.health} />
            </div>
            <ImpactStats
              floating
              co2={summary.savedCO2}
              water={summary.savedWater}
              food={summary.savedFood}
            />
          </>
        )}
      </section>
      <SceneContent>
        {view === "plant" && demo && me && <GrowthPreviewControls value={preview} base={me} onChange={setPreview} onMeal={previewMeal} />}
        {view === "plant" && me && !illustrative && (
          <div className="plant-details">
            {!demo && <GrowthProgress growth={me.growth} />}
            <ImpactStats
              co2={me.savedCO2}
              water={me.savedWater}
              food={me.savedFood}
            />
            <MealHistory history={history} />
          </div>
        )}
        {view === "forest" && (
          <div className="forest-details">
            <section className="friends-section">
              <div className="section-heading">
                <h2>Ağaçlarımız</h2>
                <label className="forest-search">
                  <Search size={16} />
                  <input
                    aria-label="Arkadaş ara"
                    placeholder="Arkadaşını bul"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="friends-grid">
                {filtered.map((p) => (
                  <button
                    className="friend-card"
                    key={p.uid}
                    onClick={() => setSelectedId(p.uid)}
                  >
                    <span className={`friend-avatar tone-${p.seed % 4}`}>
                      <Sprout size={22} />
                    </span>
                    <span>
                      <strong>
                        {studentDisplayName(p.name)}
                        {p.uid === me?.uid && <small> · sen</small>}
                      </strong>
                      <small>{p.stage}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              {!filtered.length && (
                <p className="empty-note">Sonuç bulunamadı.</p>
              )}
            </section>
            <Milestones growth={summary.growth} />
          </div>
        )}
      </SceneContent>
      <TreeVisit plant={selected} onClose={() => setSelectedId(null)} />
    </main>
  );
}
