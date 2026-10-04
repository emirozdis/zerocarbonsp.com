/** Stable numbered label for a student’s zero-based plot or fixture index. */
export function studentLabel(index: number): string {
  return `Öğrenci ${index + 1}`;
}

/** Keep numbered labels intact when a view uses a shortened display name. */
export function studentDisplayName(name: string): string {
  return /^Öğrenci \d+$/.test(name) ? name : name.split(" ")[0];
}
