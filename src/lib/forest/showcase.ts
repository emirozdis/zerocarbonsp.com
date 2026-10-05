import type { MealBaseline } from "./model.ts";
import { createReportStudents } from "./report-dataset.ts";

/** Report-backed showcase data used by both the database fixture and preview. */
export function createShowcase(baseline: MealBaseline) {
  return createReportStudents(baseline);
}
