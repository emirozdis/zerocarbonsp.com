import {
  dailyMeals,
  growPlant,
  summarize,
  type ForestData,
  type MealEvent,
} from "./model.ts";
import { createReportStudents } from "./report-dataset.ts";
/** Synthetic preview only: never persisted or mixed into school data. */
export function demoForest(extra: number[] = []): ForestData {
  const baseline = { weight: 450, co2: 1800, water: 500, targetRatio: 0.15 };
  const now = Date.now();
  const results = createReportStudents(baseline).map((student, index) => {
    const records: MealEvent[] = dailyMeals(student.records);
    if (index === 0)
      extra.forEach((weight, i) =>
        records.push({
          id: 1000 + i,
          weight,
          co2Emission: weight * 3,
          waterFootprint: weight * 0.8,
          createdAt: new Date(now + i).toISOString(),
          baselineWeight: baseline.weight,
          baselineCO2: baseline.co2,
          baselineWater: baseline.water,
          targetRatio: baseline.targetRatio,
        }),
      );
    return growPlant(
      {
        uid: student.uid,
        displayName: student.displayName,
        createdAt: student.createdAt,
        plotIndex: index,
      },
      records,
      now,
    );
  });
  const plants = results.map((r) => r.plant);
  return {
    school: { id: "demo", name: "Yeşil Vadi Okulu" },
    plants,
    me: plants[0],
    history: results[0].history,
    summary: summarize(plants),
    baseline,
    demo: true,
  };
}
