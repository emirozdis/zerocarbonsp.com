/** Shared food-waste factors: grams CO2 and liters embodied water per gram. */
export const co2Factors = [1, 5.5, 16.5] as const;
export const waterFactors = [0.322, 1.02, 15.415] as const;
export type WasteCategory = 0 | 1 | 2;

export interface EnvironmentalImpact {
  wasteGrams: number;
  co2Kilograms: number;
  waterLiters: number;
}

/** Display recorded waste and estimated embodied impact, never baseline savings. */
export function impactMetrics(impact: EnvironmentalImpact) {
  return [
    { key: "carbon", label: "Tahmini karbon ayak izi", value: impact.co2Kilograms, unit: "kg CO₂e", description: "Gıda atığının türüne ve ağırlığına göre tahmini karbon ayak izi." },
    { key: "water", label: "Tahmini su ayak izi", value: impact.waterLiters, unit: "L", description: "Atılan gıdanın üretimi için kullanılan tahmini su; doğrudan musluk suyu tüketimi değildir." },
    { key: "food", label: "Toplam gıda atığı", value: impact.wasteGrams / 1000, unit: "kg", description: "Kaydedilen gıda atıklarının toplam ağırlığı." },
  ] as const;
}

export function foodImpact(weight: number, category: WasteCategory) {
  return {
    co2Emission: weight * co2Factors[category],
    waterFootprint: weight * waterFactors[category],
  };
}
