"use client";

import { useState } from "react";
import { Survey } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

function scoreOptions(type: Survey["type"]) {
  if (type === "NPS") return Array.from({ length: 11 }, (_, i) => i); // 0..10
  if (type === "CSAT") return [1, 2, 3, 4, 5];
  return [1, 2, 3, 4, 5, 6, 7]; // CES
}

function scoreLabel(type: Survey["type"]) {
  if (type === "NPS") return "0 = nada probable, 10 = muy probable";
  if (type === "CSAT") return "1 = muy insatisfecho, 5 = muy satisfecho";
  return "1 = totalmente en desacuerdo, 7 = totalmente de acuerdo";
}

export default function PublicSurveyForm({ survey }: { survey: Survey }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [segment, setSegment] = useState("");
  const [product, setProduct] = useState("");
  const [channel, setChannel] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = scoreOptions(survey.type);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) {
      setError("Elegí un puntaje antes de enviar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("responses").insert({
      survey_id: survey.id,
      score,
      comment: comment || null,
      segment: segment || null,
      product: product || null,
      channel: channel || null,
      respondent_email: email || null
    });
    setSubmitting(false);
    if (error) {
      setError("No pudimos registrar tu respuesta. Probá de nuevo.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">¡Gracias!</h1>
          <p className="text-muted">Tu respuesta fue registrada. Tu feedback nos ayuda a mejorar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 flex items-start justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-card border border-border rounded-2xl p-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted mb-1">{survey.type}</div>
          <h1 className="text-2xl font-bold mb-2">{survey.name}</h1>
          <p className="text-lg">{survey.question}</p>
          <p className="text-sm text-muted mt-1">{scoreLabel(survey.type)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className={`w-12 h-12 rounded-lg border font-semibold transition ${
                score === n
                  ? "bg-accent text-black border-accent"
                  : "bg-elevated border-border hover:border-accent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {survey.open_question && (
          <div>
            <label className="block text-sm mb-2">{survey.open_question}</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
              placeholder="Contanos qué pensás..."
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {survey.segments?.length > 0 && (
            <div>
              <label className="block text-sm text-muted mb-1">Segmento</label>
              <select
                value={segment}
                onChange={e => setSegment(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
              >
                <option value="">—</option>
                {survey.segments.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          {survey.products?.length > 0 && (
            <div>
              <label className="block text-sm text-muted mb-1">Producto</label>
              <select
                value={product}
                onChange={e => setProduct(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
              >
                <option value="">—</option>
                {survey.products.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          )}
          {survey.channels?.length > 0 && (
            <div>
              <label className="block text-sm text-muted mb-1">Canal</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
              >
                <option value="">—</option>
                {survey.channels.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Email (opcional, para hacer seguimiento)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>

        {error && <div className="text-detractor text-sm">{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-black font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar respuesta"}
        </button>
      </form>
    </div>
  );
}
