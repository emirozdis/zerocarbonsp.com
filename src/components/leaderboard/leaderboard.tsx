"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Trophy } from "lucide-react";
import { useForest } from "@/components/forest/provider";
import { TreeVisit } from "@/components/forest/tree-visit";
import { rankStudents } from "@/lib/leaderboard";
import type { Student } from "@/lib/types";
import { PodiumStep } from "./podiumStep";
import { LeaderboardItem } from "./leaderboardItem";
export function Leaderboard() {
  const { data } = useForest();
  const [students, setStudents] = useState<Student[]>([]),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const demoStudents = useMemo(
    () =>
      data?.demo
        ? rankStudents(
            data.plants.map((p) => ({
              uid: p.uid,
              displayName: p.name,
              mealCount: p.meals,
              totalMealWeight: p.meals * data.baseline.weight,
              totalWaste: p.impact.wasteGrams,
              totalCO2: p.impact.co2Kilograms * 1000,
              totalWater: p.impact.waterLiters,
            })),
          )
        : [],
    [data],
  );
  useEffect(() => {
    if (!data || data.demo) return;
    let cancelled = false;
    setLoaded(false);
    async function load() {
      try {
        const response = await fetch("/api/records", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error(result.error || "Liderlik tablosu yüklenemedi.");
        if (!cancelled) {
          setStudents(rankStudents(result.data));
          setError("");
          setLoaded(true);
        }
      } catch (error) {
        if (!cancelled)
          setError(
            error instanceof Error ? error.message : "Bağlantı kurulamadı.",
          );
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [data, retry]);
  const ranked = data?.demo ? demoStudents : students;
  const top = ranked.filter((student) => student.wasteRatio !== null).slice(0, 3);
  const podium = [top[1], top[0], top[2]].filter((s): s is Student => !!s);
  const rest = ranked
    .map((student, index) => ({ student, rank: index + 1 }))
    .filter(
      ({ student }) =>
        (search || !top.some((entry) => entry.uid === student.uid)) &&
        student.name
          .toLocaleLowerCase("tr")
          .includes(search.toLocaleLowerCase("tr")),
    );
  const selected = data?.plants.find((p) => p.uid === selectedId);
  const selectedStudent = ranked.find((student) => student.uid === selectedId);
  return (
    <main className="forest-container leaderboard-page">
      <div className="leaderboard-heading">
        <div>
          <span className="leaderboard-title-icon">
            <Trophy size={21} />
          </span>
          <h1>Liderlik Tablosu</h1>
        </div>
        <span className="leaderboard-period">Tüm zamanlar</span>
      </div>
      {error && (
        <div className="forest-error" role="alert">
          {error}
          <button onClick={() => setRetry((r) => r + 1)}>Tekrar dene</button>
        </div>
      )}
      {!data || (!data.demo && !loaded && !error) ? (
        <div className="forest-loading">
          <Trophy size={32} />
          <p>Yükleniyor…</p>
        </div>
      ) : (
        <>
          <div className="leaderboard-school">
            {data?.school.name}
            {data?.demo && <span className="preview-pill">Önizleme</span>}
          </div>
          <section className="leaderboard-podium" aria-label="İlk üç öğrenci">
            {podium.map((student) => (
              <PodiumStep
                key={student.uid}
                student={student}
                rank={top.findIndex((s) => s.uid === student.uid) + 1}
                onClick={() => setSelectedId(student.uid)}
              />
            ))}
          </section>
          <div className="section-heading">
            <h2>Sıralama</h2>
            <label className="forest-search">
              <Search size={16} />
              <input
                aria-label="Öğrenci ara"
                placeholder="Öğrenci ara"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-table-labels">
              <span>Öğrenci</span>
              <span>İsraf oranı</span>
              <span>Kayıtlı öğün</span>
            </div>
            {rest.map(({ student, rank }) => (
              <LeaderboardItem
                student={student}
                rank={rank}
                key={student.uid}
                isMe={student.uid === data?.me?.uid}
                onClick={() => setSelectedId(student.uid)}
              />
            ))}
            {!rest.length && (
              <p className="empty-note">
                {search
                  ? "Sonuç bulunamadı."
                  : "Diğer öğrenciler burada görünecek."}
              </p>
            )}
          </div>
        </>
      )}
      <TreeVisit
        plant={selected}
        impact={
          selectedStudent
            ? {
                wasteGrams: selectedStudent.totalWaste,
                co2Kilograms: selectedStudent.co2Emissions,
                waterLiters: selectedStudent.waterFootprint,
              }
            : undefined
        }
        onClose={() => setSelectedId(null)}
      />
    </main>
  );
}
