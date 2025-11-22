export interface Student {
  id: number
  uid: string
  name: string
  displayName: string
  co2Emissions: number
  totalCO2: number
  avatar: string
}

export interface WasteRecord {
  id: number
  cardID: string
  weight: number
  co2Emission: number
  createdAt: string
  wasteType: 0 | 1 | 2
}
