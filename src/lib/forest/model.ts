import { wasteRatio, growthForWasteRatio } from "../waste-ratio.ts";
import { plantDimensions } from "./growth-profile.ts";
import type { EnvironmentalImpact } from "./impact.ts";
/** Pure, versioned simulation. A record is one completed post-meal card scan. */
export const RULES_VERSION = 2;
export interface MealBaseline {
  weight: number;
  co2: number;
  water: number;
  targetRatio: number;
}
export interface MealEvent {
  id: number;
  weight: number;
  co2Emission: number;
  waterFootprint: number;
  createdAt: string;
  baselineWeight: number;
  baselineCO2: number;
  baselineWater: number;
  targetRatio: number;
}
/** Combine category scans from the same day into one school lunch. */
export function dailyMeals(records: MealEvent[]): MealEvent[] {
  const byDate = new Map<string, MealEvent[]>();
  for (const record of records) {
    const date = record.createdAt.slice(0, 10);
    const parts = byDate.get(date);
    if (parts) parts.push(record);
    else byDate.set(date, [record]);
  }
  return [...byDate.values()].map((parts) => ({
    id: Math.min(...parts.map((part) => part.id)),
    weight: parts.reduce((sum, part) => sum + part.weight, 0),
    co2Emission: parts.reduce((sum, part) => sum + part.co2Emission, 0),
    waterFootprint: parts.reduce((sum, part) => sum + part.waterFootprint, 0),
    createdAt: parts[0].createdAt,
    baselineWeight: Math.max(...parts.map((part) => part.baselineWeight)),
    baselineCO2: Math.max(...parts.map((part) => part.baselineCO2)),
    baselineWater: Math.max(...parts.map((part) => part.baselineWater)),
    targetRatio: parts[0].targetRatio,
  }));
}
export interface Plant {
  uid: string;
  name: string;
  seed: number;
  plot: number;
  plantedAt: string;
  age: number;
  meals: number;
  growth: number;
  health: number;
  height: number;
  width: number;
  trunk: number;
  stage: string;
  savedCO2: number;
  savedWater: number;
  savedFood: number;
  recentScore: number;
  impact: EnvironmentalImpact;
}
export interface MealOutcome {
  id: number;
  date: string;
  score: number;
  growth: number;
  health: number;
  weight: number;
  message: string;
}
export interface ForestData {
  school: { id: string; name: string };
  plants: Plant[];
  me: Plant | null;
  history: MealOutcome[];
  summary: {
    health: number;
    growth: number;
    meals: number;
    savedCO2: number;
    savedWater: number;
    savedFood: number;
    impact: EnvironmentalImpact;
  };
  baseline: MealBaseline;
  demo: boolean;
}
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export function seedFor(value: string) {
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++)
    seed = Math.imul(seed ^ value.charCodeAt(i), 16777619);
  return seed >>> 0;
}
export function randomFor(seed: number, index: number) {
  let x = Math.imul(seed ^ Math.imul(index + 1, 374761393), 668265263);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
export function mealScore(meal: MealEvent) {
  const ratio =
    (meal.weight / meal.baselineWeight +
      meal.co2Emission / meal.baselineCO2 +
      meal.waterFootprint / meal.baselineWater) / 3;
  return clamp(1 - ratio / meal.targetRatio, -1, 1);
}
export function growPlant(
  user: {
    uid: string;
    displayName: string;
    createdAt: string;
    plotIndex?: number;
  },
  records: MealEvent[],
  now = Date.now(),
) {
  let growth = 0,
    health = 80,
    savedCO2 = 0,
    savedWater = 0,
    savedFood = 0,
    totalWaste = 0,
    totalMealWeight = 0;
  const history: MealOutcome[] = [];
  const ordered = [...records].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id,
  );
  for (const record of ordered) {
    const score = mealScore(record);
    totalWaste += record.weight;
    totalMealWeight += record.baselineWeight;
    const nextGrowth = growthForWasteRatio(wasteRatio(totalWaste, totalMealWeight));
    const gain = nextGrowth - growth;
    growth = nextGrowth;
    health = clamp(health + (score >= 0 ? score * 7 : score * 10), 15, 100);
    // Signed baseline differences preserve excess impact rather than inflating savings.
    savedCO2 += record.baselineCO2 - record.co2Emission;
    savedWater += record.baselineWater - record.waterFootprint;
    savedFood += record.baselineWeight - record.weight;
    history.push({
      id: record.id,
      date: record.createdAt,
      score,
      growth: gain,
      health,
      weight: record.weight,
      message:
        score > 0.1
          ? "Yeni bir büyüme, küçük bir iyi seçim."
          : score < -0.1
            ? "Biraz dinlenmeye ihtiyacım var. Bir sonraki öğünde birlikte toparlanabiliriz."
            : "Bugün dengedeyiz. Bir sonraki küçük adım seni bekliyor.",
    });
  }
  const plantedAt = user.createdAt.includes("T")
    ? user.createdAt
    : user.createdAt.replace(" ", "T") + "Z";
  const plant: Plant = {
    uid: user.uid,
    name: user.displayName,
    plot: user.plotIndex ?? 0,
    seed: seedFor(user.uid),
    plantedAt,
    age: Math.max(
      0,
      Math.floor((now - new Date(plantedAt).getTime()) / 86400000),
    ),
    meals: ordered.length,
    growth,
    health,
    ...plantDimensions(growth),
    stage:
      growth === 0
        ? "Tohum"
        : growth < 3
          ? "Filiz"
          : growth < 14
            ? "Fidan"
            : growth < 60
              ? "Genç ağaç"
              : "Kök salan ağaç",
    savedCO2: savedCO2 / 1000,
    savedWater,
    savedFood: savedFood / 1000,
    recentScore: history.length
      ? history.slice(-7).reduce((s, r) => s + r.score, 0) /
        Math.min(7, history.length)
      : 0,
    impact: {
      wasteGrams: ordered.reduce((sum, record) => sum + record.weight, 0),
      co2Kilograms:
        ordered.reduce((sum, record) => sum + record.co2Emission, 0) / 1000,
      waterLiters: ordered.reduce(
        (sum, record) => sum + record.waterFootprint,
        0,
      ),
    },
  };
  return { plant, history: history.reverse() };
}
export function summarize(plants: Plant[]) {
  const active = plants.filter((p) => p.meals > 0);
  return {
    health: active.length
      ? active.reduce((s, p) => s + p.health, 0) / active.length
      : 80,
    growth: plants.reduce((s, p) => s + p.growth, 0),
    meals: plants.reduce((s, p) => s + p.meals, 0),
    savedCO2: plants.reduce((s, p) => s + p.savedCO2, 0),
    savedWater: plants.reduce((s, p) => s + p.savedWater, 0),
    savedFood: plants.reduce((s, p) => s + p.savedFood, 0),
    impact: {
      wasteGrams: plants.reduce((s, p) => s + p.impact.wasteGrams, 0),
      co2Kilograms: plants.reduce((s, p) => s + p.impact.co2Kilograms, 0),
      waterLiters: plants.reduce((s, p) => s + p.impact.waterLiters, 0),
    },
  };
}
