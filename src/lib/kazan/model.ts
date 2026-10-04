/** One shared school goal. Kilograms use the existing signed food-saving total. */
export interface KazanGoal {
  id: string;
  title: string;
  targetKg: number;
  reward: string;
  description: string;
}

// Proposed campaign content, pending school approval; not a scheduled event.
export const SCHOOL_GOAL: KazanGoal = {
  id: "school-sapling-day",
  title: "Fidan dikme etkinliği",
  targetKg: 500,
  reward: "Birlikte kök salıyoruz.",
  description:
    "Kazan dolduğunda, okulumuzun birlikte katılacağı bir fidan dikme etkinliğinin hedefi tamamlanır. Etkinlik tarihi ve yeri okul tarafından duyurulur.",
};

export const KAZAN_MILESTONES = [
  {
    percent: 0,
    title: "İlk adım",
    description:
      "Her güzel değişim küçük bir seçimle başlar. Ortak kazanımız hazır!",
    ingredient: "Tohum",
  },
  {
    percent: 25,
    title: "İyilik filizleniyor",
    description:
      "Hedefin dörtte biri tamamlandı. Küçük katkılarımız aynı kazanda buluşuyor.",
    ingredient: "Filiz",
  },
  {
    percent: 50,
    title: "Birlikte büyüyoruz",
    description:
      "Yolu yarıladık! Okulca yaptığımız seçimler kazanımızı renklendiriyor.",
    ingredient: "Hasat",
  },
  {
    percent: 75,
    title: "Az kaldı!",
    description:
      "Son çeyreğe geldik. Her öğün bizi ortak etkinliğimize biraz daha yaklaştırıyor.",
    ingredient: "Bereket",
  },
  {
    percent: 100,
    title: "Haydi, fidan dikelim!",
    description:
      "Ortak hedef tamamlandı! Sıradaki adım, okulun etkinlik duyurusunu paylaşması.",
    ingredient: "Kutlama",
  },
] as const;

export function kazanProgress(savedKg: number, targetKg: number) {
  if (!Number.isFinite(targetKg) || targetKg <= 0)
    throw new RangeError(
      "The school goal must be a positive number of kilograms.",
    );
  const totalKg = Number.isFinite(savedKg) ? savedKg : 0;
  const fill = Math.min(1, Math.max(0, totalKg / targetKg));
  return {
    totalKg,
    fill,
    percent: Math.floor(fill * 100),
    remainingKg: Math.max(0, targetKg - totalKg),
    completed: totalKg >= targetKg,
    nextMilestone:
      KAZAN_MILESTONES.find((milestone) => milestone.percent > fill * 100) ??
      null,
  };
}

export const formatKazanNumber = (value: number, digits = 0) =>
  value.toLocaleString("tr-TR", { maximumFractionDigits: digits });
