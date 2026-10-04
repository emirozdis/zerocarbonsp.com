import { studentLabel } from "./student-label";
import { growPlant, summarize, type ForestData, type MealEvent } from "./model";
/** Synthetic preview only: never persisted or mixed into school data. */
export function demoForest(extra: number[] = []): ForestData {
  const baseline = { weight: 450, co2: 1800, water: 500, targetRatio: 0.15 };
  const now = Date.now();
  const results = Array.from({ length: 24 }, (_, index) => {
    const count = index === 0 ? 48 : (index * 17 + 7) % 90;
    const records: MealEvent[] = Array.from({ length: count }, (_, i) => {
      const weight =
        index % 7 === 3 && i > count - 6 ? 240 : 4 + ((i * 7 + index * 3) % 35);
      return {
        id: i,
        weight,
        co2Emission: weight * 3,
        waterFootprint: weight * 0.8,
        createdAt: new Date(now - (count - i) * 86400000).toISOString(),
        baselineWeight: baseline.weight,
        baselineCO2: baseline.co2,
        baselineWater: baseline.water,
        targetRatio: baseline.targetRatio,
      };
    });
    if (index === 0)
      extra.forEach((weight, i) =>
        records.push({
          id: count + i,
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
        uid: `demo-${index}`,
        displayName: studentLabel(index),
        createdAt: new Date(now - (count + 5) * 86400000).toISOString(),
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
