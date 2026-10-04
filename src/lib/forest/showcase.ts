import type { MealBaseline, MealEvent } from "./model";
import { studentLabel } from "./student-label";
import { randomFor, seedFor } from "./model";
import {
  co2Factors,
  foodImpact,
  waterFactors,
  type WasteCategory,
} from "./impact";

export const showcaseProfiles = [
  { story: "Düzenli düşük israf", pattern: "careful" },
  {
    story: "Ay boyunca giderek iyileşen alışkanlıklar",
    pattern: "improving",
  },
  {
    story: "Bir aksaklığın ardından toparlanma",
    pattern: "recovery",
  },
  {
    story: "Son hafta daha çok özen isteyen ağaç",
    pattern: "setback",
  },
  {
    story: "İyi ve zor öğünler bir arada",
    pattern: "mixed",
  },
  {
    story: "Sık sık tamamen israfsız öğünler",
    pattern: "zero",
  },
  {
    story: "Küçük ama istikrarlı adımlar",
    pattern: "steady",
  },
  {
    story: "Daha yavaş büyüyen bir filiz",
    pattern: "slow",
  },
  {
    story: "Zor bir ay, yeni başlangıç fırsatı",
    pattern: "struggling",
  },
  {
    story: "Güçlü başlayan, dengeli devam eden gelişim",
    pattern: "balanced",
  },
] as const;

export interface ShowcaseStudent {
  uid: string;
  cardID: string;
  displayName: string;
  schoolId: string;
  plotIndex: number;
  createdAt: string;
  story: string;
  records: (MealEvent & { wasteType: WasteCategory; eventId: string })[];
}

function desiredScore(
  pattern: string,
  progress: number,
  day: number,
  noise: number,
) {
  switch (pattern) {
    case "careful":
      return 0.88 + noise * 0.1;
    case "improving":
      return -0.65 + progress * 1.6 + noise * 0.06;
    case "recovery":
      return progress < 0.32 ? 0.85 : progress < 0.65 ? -0.8 : 0.98;
    case "setback":
      return progress < 0.7 ? 0.86 : -0.92;
    case "mixed":
      return day % 4 === 0 ? -0.7 : 0.7 + noise * 0.15;
    case "zero":
      return day % 3 === 0 ? 1 : 0.9 + noise * 0.06;
    case "steady":
      return 0.38 + noise * 0.2;
    case "slow":
      return 0.055 + noise * 0.035;
    case "struggling":
      return day % 5 === 0 ? 0.6 : -0.48 - noise * 0.25;
    case "balanced":
      return progress < 0.45 ? 0.95 : 0.48 + noise * 0.15;
    default:
      throw new Error(`Unknown showcase pattern: ${pattern}`);
  }
}

/** One lunch per weekday, reproducible outcomes using the production factors. */
export function createShowcase(
  baseline: MealBaseline,
  start = "2026-09-01",
  end = "2026-09-30",
): ShowcaseStudent[] {
  const from = new Date(`${start}T09:00:00Z`),
    until = new Date(`${end}T09:00:00Z`);
  if (
    !Number.isFinite(from.getTime()) ||
    !Number.isFinite(until.getTime()) ||
    until < from ||
    until.getTime() - from.getTime() > 366 * 86400000
  ) {
    throw new Error(
      "Showcase dates must describe a valid range of at most one year.",
    );
  }
  const days: string[] = [];
  for (
    const date = new Date(from);
    date <= until;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6)
      days.push(date.toISOString().slice(0, 10));
  }
  if (!days.length)
    throw new Error("The showcase needs at least one school day.");
  return showcaseProfiles.map((profile, index) => {
    const uid = `showcase-student-${String(index + 1).padStart(2, "0")}`,
      seed = seedFor(uid);
    const records = days.map((date, day) => {
      const wasteType = ((day + index) % 3) as WasteCategory;
      const score = desiredScore(
        profile.pattern,
        day / Math.max(1, days.length - 1),
        day,
        randomFor(seed, day),
      );
      const burdenPerGram =
        (1 / baseline.weight +
          co2Factors[wasteType] / baseline.co2 +
          waterFactors[wasteType] / baseline.water) /
        3;
      const weight =
        Math.round(
          Math.max(0, ((1 - score) * baseline.targetRatio) / burdenPerGram) *
            100,
        ) / 100;
      return {
        id: index * days.length + day + 1,
        weight,
        ...foodImpact(weight, wasteType),
        createdAt: `${date}T09:${String(10 + index * 2).padStart(2, "0")}:00.000Z`,
        wasteType,
        eventId: `showcase-v1-${uid}-${date}`,
        baselineWeight: baseline.weight,
        baselineCO2: baseline.co2,
        baselineWater: baseline.water,
        targetRatio: baseline.targetRatio,
      };
    });
    return {
      uid,
      cardID: `TEST${String(index + 1).padStart(3, "0")}`,
      displayName: studentLabel(index),
      schoolId: "default",
      plotIndex: index,
      createdAt: `${start}T06:00:00.000Z`,
      story: profile.story,
      records,
    };
  });
}
