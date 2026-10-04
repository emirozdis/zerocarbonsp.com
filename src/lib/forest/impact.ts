/** Shared food-waste factors: grams CO2 and liters embodied water per gram. */
export const co2Factors = [1, 5.5, 16.5] as const;
export const waterFactors = [0.322, 1.02, 15.415] as const;
export type WasteCategory = 0 | 1 | 2;

export function foodImpact(weight: number, category: WasteCategory) {
  return {
    co2Emission: weight * co2Factors[category],
    waterFootprint: weight * waterFactors[category],
  };
}
