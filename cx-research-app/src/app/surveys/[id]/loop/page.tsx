import { createClient } from "@/lib/supabase/server";
import { Survey, Response, LoopAction } from "@/lib/types";
import { classifyPriority, suggestAction, suggestOwner } from "@/lib/metrics";
import { categorize } from "@/lib/sentiment";
import LoopTable from "@/components/LoopTable";

export const dynamic = "force-dynamic";

export default async function LoopPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: survey } = await supabase.from("surveys").select("*").eq("id", params.id).single();
  const { data: responses } = await supabase
    .from("responses")
    .select("*")
    .eq("survey_id", params.id)
    .order("created_at", { ascending: false });
  const { data: actions } = await supabase
    .from("loop_actions")
    .select("*")
    .in("response_id", (responses ?? []).map(r => r.id));

  const s = survey as Survey;
  const rs = (responses ?? []) as Response[];
  const acts = (actions ?? []) as LoopAction[];
  const byResponse: Record<string, LoopAction> = {};
  for (const a of acts) byResponse[a.response_id] = a;

  const cases = rs
    .map(r => {
      const priority = classifyPriority(s.type, r);
      if (!priority) return null;
      return {
        response: r,
        priority,
        cats: categorize(r.comment),
        suggestedAction: suggestAction(r, priority),
        suggestedOwner: suggestOwner(r, priority),
        existing: byResponse[r.id]
      };
    })
    .filter(Boolean) as any[];

  cases.sort((a, b) => {
    const order: Record<string, number> = { high: 0, med: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const counts = {
    high: cases.filter(c => c.priority === "high").length,
    med: cases.filter(c => c.priority === "med").length,
    pending: cases.filter(c => !c.existing || c.existing.status === "pending").length,
    done: cases.filter(c => c.existing?.status === "done").length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase text-muted">Prioridad alta &lt;24h</div>
          <div className="text-3xl font-bold text-detractor">{counts.high}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase text-muted">Prioridad media &lt;72h</div>
          <div className="text-3xl font-bold text-passive">{counts.med}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase text-muted">Pendientes</div>
          <div className="text-3xl font-bold">{counts.pending}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase text-muted">Resueltos</div>
          <div className="text-3xl font-bold text-promoter">{counts.done}</div>
        </div>
      </div>

      <LoopTable cases={cases} surveyType={s.type} />
    </div>
  );
}
