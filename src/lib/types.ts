export interface Student {
  id: number
  uid: string
  name: string
  displayName: string
  co2Emissions: number
  totalCO2: number
  waterFootprint: number
  totalWater: number
  wasteRatio: number | null
  mealCount: number
  avatar: string
}

export interface WasteRecord {
  id: number
  cardID: string
  weight: number
  co2Emission: number
  waterFootprint: number
  createdAt: string
  wasteType: 0 | 1 | 2
}

export interface DailyWaste {
  day: string
  co2: number
  water: number
}

export interface WasteTypeStats {
  type: string
  weight: number
  co2: number
  water: number
}
