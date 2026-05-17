// Industry benchmarks for NPS / CSAT / CES.
// Returns a contextual badge { label, tone } for a given metric + value.

export type BenchmarkTone = "good" | "warn" | "bad";
export interface BenchmarkBadge {
  label: string;
  tone: BenchmarkTone;
}

export function npsBadge(value: number | null): BenchmarkBadge | null {
  if (value === null) return null;
  if (value >= 50) return { label: "Excelente (top quartile)", tone: "good" };
  if (value >= 30) return { label: "Bueno (benchmark típico)", tone: "good" };
  if (value >= 0) return { label: "Subóptimo", tone: "warn" };
  return { label: "Crítico (boca a boca negativo)", tone: "bad" };
}

export function csatBadge(value: number | null): BenchmarkBadge | null {
  if (value === null) return null;
  if (value >= 85) return { label: "Top quartile", tone: "good" };
  if (value >= 75) return { label: "Bueno", tone: "good" };
  if (value >= 65) return { label: "Subóptimo", tone: "warn" };
  return { label: "Crítico", tone: "bad" };
}

export function cesBadge(value: number | null): BenchmarkBadge | null {
  if (value === null) return null;
  if (value >= 80) return { label: "Top quartile", tone: "good" };
  if (value >= 65) return { label: "Bueno", tone: "good" };
  if (value >= 50) return { label: "Fricción alta", tone: "warn" };
  return { label: "Fricción crítica", tone: "bad" };
}
