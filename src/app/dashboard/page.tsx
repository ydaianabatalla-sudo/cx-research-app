import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Survey } from "@/lib/types";
import { calcScore } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: surveys } = await supabase
    .from("surveys")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list = (surveys ?? []) as Survey[];

  const counts: Record<string, { count: number; score: number | null }> = {};
  for (const s of list) {
    const { data: responses } = await supabase
      .from("responses")
      .select("score, created_at")
      .eq("survey_id", s.id);
    const rs = (responses ?? []).map(r => ({ ...r, id: "", survey_id: s.id, comment: null, segment: null, product: null, channel: null, respondent_email: null }));
    counts[s.id] = { count: rs.length, score: calcScore(s.type, rs as any) };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tus encuestas</h1>
          <p className="text-muted mt-1">Diseñá, lanzá y analizá surveys de CX</p>
        </div>
        <Link href="/surveys/new" className="bg-accent text-black font-semibold px-5 py-2.5 rounded-lg hover:opacity-90">
          + Nueva encuesta
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Todavía no tenés encuestas</h2>
          <p className="text-muted mb-6">Creá tu primera encuesta y compartila con un link en menos de un minuto.</p>
          <Link href="/surveys/new" className="bg-accent text-black font-semibold px-5 py-2.5 rounded-lg inline-block">
            Crear mi primera encuesta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(s => (
            <Link
              key={s.id}
              href={`/surveys/${s.id}`}
              className="bg-card border border-border rounded-xl p-5 hover:border-accent transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-accent font-semibold">{s.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === "active" ? "bg-promoter/20 text-promoter" : "bg-muted/20 text-muted"
                }`}>
                  {s.status}
                </span>
              </div>
              <h3 className="font-semibold mb-1 line-clamp-1">{s.name}</h3>
              <p className="text-sm text-muted mb-4 line-clamp-2">{s.question}</p>
              <div className="flex items-end justify-between border-t border-border pt-3">
                <div>
                  <div className="text-xs text-muted">Score</div>
                  <div className="text-2xl font-bold">
                    {counts[s.id]?.score ?? "—"}
                    {counts[s.id]?.score !== null && s.type !== "NPS" && "%"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">Respuestas</div>
                  <div className="text-2xl font-bold">{counts[s.id]?.count ?? 0}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
