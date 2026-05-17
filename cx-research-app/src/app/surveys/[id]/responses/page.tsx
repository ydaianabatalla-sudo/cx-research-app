import { createClient } from "@/lib/supabase/server";
import { Response } from "@/lib/types";
import { detectSentiment } from "@/lib/sentiment";

export const dynamic = "force-dynamic";

export default async function ResponsesPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: responses } = await supabase
    .from("responses")
    .select("*")
    .eq("survey_id", params.id)
    .order("created_at", { ascending: false });

  const list = (responses ?? []) as Response[];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-4">Todas las respuestas ({list.length})</h2>
      {list.length === 0 ? (
        <div className="text-center py-12 text-muted">Todavía no hay respuestas. Compartí el link público para empezar a recibir feedback.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted border-b border-border">
              <tr>
                <th className="text-left py-2 px-2">Fecha</th>
                <th className="text-left py-2 px-2">Score</th>
                <th className="text-left py-2 px-2">Segmento</th>
                <th className="text-left py-2 px-2">Producto</th>
                <th className="text-left py-2 px-2">Canal</th>
                <th className="text-left py-2 px-2">Sentiment</th>
                <th className="text-left py-2 px-2">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => {
                const sent = detectSentiment(r.comment);
                const sentColor = sent === "positive" ? "text-promoter"
                  : sent === "negative" ? "text-detractor"
                  : sent === "mixed" ? "text-blue-400"
                  : "text-muted";
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-elevated">
                    <td className="py-2 px-2 text-muted text-xs">{r.created_at.substring(0, 10)}</td>
                    <td className="py-2 px-2 font-semibold">{r.score}</td>
                    <td className="py-2 px-2 text-muted">{r.segment || "—"}</td>
                    <td className="py-2 px-2 text-muted">{r.product || "—"}</td>
                    <td className="py-2 px-2 text-muted">{r.channel || "—"}</td>
                    <td className={`py-2 px-2 ${sentColor}`}>{sent}</td>
                    <td className="py-2 px-2 max-w-md truncate" title={r.comment || ""}>{r.comment || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
