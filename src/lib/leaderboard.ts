import { wasteRatio } from "./waste-ratio.ts";
import type { Student } from "./types";
export interface LeaderboardUser {
  uid: string;
  displayName: string;
  totalCO2: number;
  totalWater: number;
  totalWaste: number;
  totalMealWeight: number;
  mealCount: number;
}
/** Compare waste against recorded meal portions, independent of attendance. */
export function rankStudents(users: LeaderboardUser[]): Student[] {
  return users
    .map((user, index) => ({
      id: index,
      mealCount: user.mealCount,
      wasteRatio: user.mealCount > 0 ? wasteRatio(user.totalWaste, user.totalMealWeight) : null,
      uid: user.uid,
      name: user.displayName,
      displayName: user.displayName,
      totalCO2: user.totalCO2 / 1000,
      co2Emissions: user.totalCO2 / 1000,
      totalWater: user.totalWater,
      waterFootprint: user.totalWater,
      avatar: user.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }))
    .sort(
      (a, b) =>
        (a.wasteRatio ?? Infinity) - (b.wasteRatio ?? Infinity) ||
        a.uid.localeCompare(b.uid),
    );
}
