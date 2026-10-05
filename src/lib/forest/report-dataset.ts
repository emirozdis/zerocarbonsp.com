import type { MealBaseline, MealEvent } from "./model.ts";
import { foodImpact, type WasteCategory } from "./impact.ts";

export const REPORT_PERIOD = {
  start: "2025-11-03",
  end: "2025-11-28",
} as const;

export interface ReportStudent {
  uid: string;
  cardID: string;
  displayName: string;
  schoolId: string;
  plotIndex: number;
  createdAt: string;
  story: string;
  records: ReportRecord[];
}

export type ReportRecord = MealEvent & {
  wasteType: WasteCategory;
  eventId: string;
};

/**
 * The detailed results table in the project report is the source of truth.
 * Category weights are the unique solution that reconciles each student's
 * reported waste, carbon and water totals with the report's impact factors.
 */
export const reportProfiles = [
  {
    story: "Et ürünleri ağırlıklı yüksek çevresel etki",
    categoryWeights: [576.889815147243, 288.01889683797583, 775.0912880147812],
  },
  {
    story: "Sebze ve süt ürünleri ağırlıklı düşük çevresel etki",
    categoryWeights: [771.2605189187295, 428.6783597054265, 0.06112137584392158],
  },
  {
    story: "Dengeli atık profili ve dönem sonu iyileşme",
    categoryWeights: [360, 120, 260],
  },
  {
    story: "En düşük gıda israfı ve çevresel etki",
    categoryWeights: [125.12605189187296, 29.86783597054265, 25.006112137584392],
  },
] as const;

export const reportTotals = [
  { wasteGrams: 1640, co2Kilograms: 14.95, waterLiters: 12427.57 },
  { wasteGrams: 1200, co2Kilograms: 3.13, waterLiters: 686.54 },
  { wasteGrams: 740, co2Kilograms: 5.31, waterLiters: 4246.22 },
  { wasteGrams: 180, co2Kilograms: 0.702, waterLiters: 456.225 },
] as const;

function schoolDays() {
  const days: string[] = [];
  const current = new Date(`${REPORT_PERIOD.start}T09:00:00.000Z`);
  const end = new Date(`${REPORT_PERIOD.end}T09:00:00.000Z`);
  while (current <= end) {
    if (current.getUTCDay() !== 0 && current.getUTCDay() !== 6)
      days.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}

function distribute(total: number, count: number, seed: number) {
  const weights = Array.from(
    { length: count },
    (_, index) => 0.78 + (((index * 7 + seed * 5) % 11) / 10) * 0.44,
  );
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const values = weights.map((value) => (total * value) / weightTotal);
  values[values.length - 1] += total - values.reduce((sum, value) => sum + value, 0);
  return values;
}

export function createReportStudents(baseline: MealBaseline): ReportStudent[] {
  const days = schoolDays();
  return reportProfiles.map((profile, studentIndex) => {
    const dailyByCategory = profile.categoryWeights.map((total, category) =>
      distribute(total, days.length, studentIndex * 3 + category),
    );
    const records = days.flatMap((date, dayIndex) =>
      ([0, 1, 2] as const).map((wasteType) => {
        const weight = dailyByCategory[wasteType][dayIndex];
        return {
          id: studentIndex * days.length * 3 + dayIndex * 3 + wasteType + 1,
          weight,
          ...foodImpact(weight, wasteType),
          createdAt: `${date}T09:${String(10 + wasteType).padStart(2, "0")}:00.000Z`,
          wasteType,
          eventId: `report-2025-11-student-${studentIndex + 1}-${date}-${wasteType}`,
          baselineWeight: baseline.weight,
          baselineCO2: baseline.co2,
          baselineWater: baseline.water,
          targetRatio: baseline.targetRatio,
        };
      }),
    );
    return {
      uid: `showcase-student-${String(studentIndex + 1).padStart(2, "0")}`,
      cardID: `TEST${String(studentIndex + 1).padStart(3, "0")}`,
      displayName: `Öğrenci ${studentIndex + 1}`,
      schoolId: "default",
      plotIndex: studentIndex,
      createdAt: `${REPORT_PERIOD.start}T06:00:00.000Z`,
      story: profile.story,
      records,
    };
  });
}
