/** Recorded food waste divided by the corresponding historical meal portions. */
export function wasteRatio(totalWaste: number, totalMealWeight: number): number | null {
  return totalMealWeight > 0 ? Math.max(0, totalWaste) / totalMealWeight : null;
}

/** Same ratio as the leaderboard: less waste always means a larger tree.
 * Zero waste reaches 60 growth units; 5% reaches 15. Attendance adds no size bonus.
 */
export function growthForWasteRatio(ratio: number | null): number {
  return ratio === null ? 0 : 60 / (1 + ratio / 0.05) ** 2;
}
