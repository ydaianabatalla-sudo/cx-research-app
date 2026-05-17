"use client";

import { useState } from "react";
import { Response, LoopAction, LoopPriority, LoopStatus, SurveyType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface CaseRow {
  response: Response;
  priority: LoopPriority;
  cats: string[];
  suggestedAction: string;
  suggestedOwner: string;
  existing?: LoopAction | null;
}

const STATUS_OPTIONS: { value: LoopStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En curso" },
  { value: "done", label: "Resuelto" },
  { value: "skipped", label: "Saltado" }
];

export default function LoopTable({ cases, surveyType }: { cases: CaseRow[]; surveyType: SurveyType }) {
  const supabase = createClient();
  const [localState, setLocalState] = useState<Record<string, LoopAction | null>>(() => {
    const map: Record<string, LoopAction | null> = {};
    cases.forEach(c => { map[c.response.id] = c.existing ?? null; });
    return map;
  });

  async function updateAction(c: CaseRow, patch: Partial<LoopAction>) {
    const existing = localState[c.response.id];
    if (existing) {
      const { data, error } = await supabase
        .from("loop_actions")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (!error && data) {
        setLocalState(s => ({ ...s, [c.response.id]: data as LoopAction }));
      }
    } else {
      const { data, error } = await supabase
        .from("loop_actions")
        .insert({
          response_id: c.response.id,
          priority: c.priority,
          status: "pending",
          owner: c.suggestedOwner,
          action_taken: c.suggestedAction,
          ...patch
        })
        .select()
        .single();
      if (!error && data) {
        setLocalState(s => ({ ...s, [c.response.id]: data as LoopAction }));
      }
    }
  }

  if (cases.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-muted">
        No hay casos que requieran closing the loop por ahora. ¡Buenas noticias!
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-1">Pipeline de closing the loop</h2>
      <p className="text-sm text-muted mb-4">
        Ordenado por prioridad. Editá el dueño, la acción y el status según vayas trabajando los casos.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted border-b border-border">
            <tr>
              <th className="text-left py-2 px-2">Fecha</th>
              <th className="text-left py-2 px-2">Score</th>
              <th className="text-left py-2 px-2">Prioridad</th>
              <th className="text-left py-2 px-2">Temas</th>
              <th className="text-left py-2 px-2">Comentario</th>
              <th className="text-left py-2 px-2">Dueño</th>
              <th className="text-left py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => {
              const action = localState[c.response.id];
              const priorityBadge = c.priority === "high" ? "bg-detractor/20 text-detractor"
                : c.priority === "med" ? "bg-passive/20 text-passive"
                : "bg-blue-500/20 text-blue-400";
              return (
                <tr key={c.response.id} className="border-b border-border align-top">
                  <td className="py-3 px-2 text-muted text-xs whitespace-nowrap">
                    {c.response.created_at.substring(0, 10)}
                  </td>
                  <td className="py-3 px-2 font-bold">{surveyType}: {c.response.score}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityBadge}`}>{c.priority}</span>
                  </td>
                  <td className="py-3 px-2 text-xs text-muted">{c.cats.join(" · ") || "—"}</td>
                  <td className="py-3 px-2 max-w-xs text-xs italic" title={c.response.comment || ""}>
                    {c.response.comment ? `"${c.response.comment.slice(0, 120)}${c.response.comment.length > 120 ? '…' : ''}"` : "—"}
                  </td>
                  <td className="py-3 px-2">
                    <input
                      defaultValue={action?.owner ?? c.suggestedOwner}
                      onBlur={e => updateAction(c, { owner: e.target.value })}
                      className="bg-elevated border border-border rounded px-2 py-1 text-xs w-32"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={action?.status ?? "pending"}
                      onChange={e => updateAction(c, { status: e.target.value as LoopStatus })}
                      className="bg-elevated border border-border rounded px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
