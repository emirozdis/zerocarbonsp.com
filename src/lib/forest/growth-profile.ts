/** Presentation milestones; earned growth and meal scoring remain independent. */
export const GROWTH_STAGES = [
  { label: "Tohum", at: 0, sample: 0, detail: "Her orman küçük bir tohumla başlar." },
  { label: "Çimlenme", at: 0.001, sample: 0.35, detail: "Tohum açılıyor, ilk yaşam toprağa tutunuyor." },
  { label: "Filiz", at: 0.6, sample: 1.8, detail: "İlk yapraklar ışığa doğru açılıyor." },
  { label: "Fidan", at: 3, sample: 8, detail: "Gövde güçleniyor, yeni dallar uzanıyor." },
  { label: "Genç ağaç", at: 14, sample: 36, detail: "Dallar çoğalıyor, gölgen büyüyor." },
  { label: "Kök salan ağaç", at: 60, sample: 100, detail: "Güçlü kökler, geniş bir taç, yaşayan bir dünya." },
  { label: "Köklü ağaç", at: 160, sample: 240, detail: "Büyüme bitmez. Her katkı yeni bir iz bırakır." },
] as const;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export function smooth(from: number, to: number, value: number) {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}
export function growthStage(growth: number) {
  const index = growth <= 0 ? 0 : Math.max(1, GROWTH_STAGES.reduce((last, stage, i) => growth >= stage.at ? i : last, 0));
  const stage = GROWTH_STAGES[index];
  const next = GROWTH_STAGES[index + 1];
  return { ...stage, index, next, progress: next ? clamp01((growth - stage.at) / (next.at - stage.at)) : 1 };
}
/** Metres. The original adult curves are preserved; emergence now starts at zero. */
export function plantDimensions(growth: number) {
  const g = Math.max(0, growth);
  const emergence = smooth(0, 0.6, g);
  return {
    height: (0.08 + 2.4 * Math.log1p(g / 12)) * emergence,
    width: (0.04 + 1.9 * Math.log1p(g / 18)) * emergence,
    trunk: (0.01 + 0.16 * Math.log1p(g / 25)) * emergence,
  };
}
export function growthProfile(growth: number) {
  return {
    ...plantDimensions(growth),
    emergence: smooth(0, 0.6, growth),
    wood: smooth(1.5, 12, growth),
    roots: smooth(6, 80, growth),
    cotyledons: smooth(0.06, 0.65, growth) * (1 - smooth(2.5, 8, growth)),
    maturity: smooth(14, 160, growth),
  };
}
/** Logarithmic timeline gives seedlings enough space to inspect. */
export const PREVIEW_MAX_GROWTH = 320;
export function timelineGrowth(position: number) {
  return Math.expm1(clamp01(position) * Math.log1p(PREVIEW_MAX_GROWTH));
}
export function growthPosition(growth: number) {
  return clamp01(Math.log1p(Math.max(0, growth)) / Math.log1p(PREVIEW_MAX_GROWTH));
}
