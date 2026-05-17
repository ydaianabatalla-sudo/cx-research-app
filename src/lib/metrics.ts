import { Response, SurveyType, LoopPriority } from "./types";
import { categorize, normalize } from "./sentiment";

export function npsCategory(score: number): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

export function calcNPS(responses: Response[]): number | null {
  if (!responses.length) return null;
  const prom = responses.filter(r => npsCategory(r.score) === "promoter").length;
  const det = responses.filter(r => npsCategory(r.score) === "detractor").length;
  return Math.round(((prom - det) / responses.length) * 100);
}

export function calcCSAT(responses: Response[]): number | null {
  if (!responses.length) return null;
  const sat = responses.filter(r => r.score >= 4).length;
  return Math.round((sat / responses.length) * 100);
}

export function calcCES(responses: Response[]): number | null {
  if (!responses.length) return null;
  const easy = responses.filter(r => r.score >= 5).length;
  return Math.round((easy / responses.length) * 100);
}

export function calcScore(type: SurveyType, responses: Response[]): number | null {
  if (type === "NPS") return calcNPS(responses);
  if (type === "CSAT") return calcCSAT(responses);
  if (type === "CES") return calcCES(responses);
  return null;
}

export function classifyPriority(
  type: SurveyType,
  response: Response
): LoopPriority | null {
  const score = response.score;
  const comment = normalize(response.comment ?? "");
  const cats = categorize(response.comment);

  if (type === "NPS" && score <= 3) {
    if (
      cats.includes("Trust & Security") ||
      /robo|robaron|denuncia|defensoria|reintegro|engano|enganada|me voy|doy de baja|cambiarme|abogado|prensa|redes/.test(comment)
    ) {
      return "high";
    }
    return comment.length > 20 ? "high" : "med";
  }
  if (type === "CSAT" && score <= 2) return "med";
  if (type === "CES" && score <= 3) return "med";
  if (type === "NPS" && score >= 4 && score <= 6 && comment.length > 5) return "med";
  return null;
}

export function suggestOwner(response: Response, priority: LoopPriority): string {
  const cats = categorize(response.comment);
  if (priority === "high") return "Head de CX";
  if (cats.includes("Support")) return "Manager de Soporte";
  if (cats.includes("Speed & Performance") || cats.includes("Reliability / Consistency")) return "Engineering / Operaciones";
  if (cats.includes("Price / Value")) return "Pricing / Comercial";
  if (cats.includes("Billing / Administrative")) return "Facturación";
  if (cats.includes("Trust & Security")) return "CX + Legal/Compliance";
  if (cats.includes("Onboarding / First experience")) return "Onboarding / Operaciones";
  if (cats.includes("Product Features")) return "Product Manager";
  if (cats.includes("Communication")) return "Marketing / Comms";
  return "CX Specialist";
}

export function suggestAction(response: Response, priority: LoopPriority): string {
  const cats = categorize(response.comment);
  if (priority === "high") {
    if (cats.includes("Trust & Security")) {
      return "Llamada inmediata del Head de CX + derivación a Legal/Compliance";
    }
    return "Llamada en <24h del Head de CX, ofrecer compensación si aplica";
  }
  if (cats.includes("Billing / Administrative") || cats.includes("Price / Value"))
    return "Mail personalizado revisando facturación y explicando cargos";
  if (cats.includes("Support"))
    return "Mail del Manager de Soporte con disculpas y resolución";
  if (cats.includes("Onboarding / First experience"))
    return "Mail con guía + soporte humano para completar la activación";
  if (cats.includes("Speed & Performance") || cats.includes("Reliability / Consistency"))
    return "Mail acknowledging issue + status de fix técnico/operativo";
  if (cats.includes("Product Features"))
    return "Mail de agradecimiento + ticket a Producto";
  if (cats.includes("Communication"))
    return "Mail aclarando información + ajuste de proceso de comunicación";
  return "Mail personalizado del equipo de CX";
}

export function groupByMonth(responses: Response[]): Record<string, Response[]> {
  const groups: Record<string, Response[]> = {};
  for (const r of responses) {
    const m = (r.created_at ?? "").substring(0, 7);
    if (!m) continue;
    if (!groups[m]) groups[m] = [];
    groups[m].push(r);
  }
  return groups;
}
