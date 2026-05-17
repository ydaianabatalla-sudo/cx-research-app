"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurveyType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_QUESTIONS: Record<SurveyType, { q: string; open: string }> = {
  NPS: {
    q: "En una escala de 0 a 10, ¿qué tan probable es que recomiendes [Producto] a un colega o amigo?",
    open: "¿Qué es lo que más influyó en tu respuesta?"
  },
  CSAT: {
    q: "¿Qué tan satisfecho estás con [interacción]?",
    open: "¿Qué fue lo que más te marcó (positivo o negativo)?"
  },
  CES: {
    q: "[Tarea] me resultó fácil de hacer.",
    open: "¿Qué fue lo que más te complicó (o facilitó) la tarea?"
  }
};

function randomShareId() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
}

export default function SurveyBuilder() {
  const router = useRouter();
  const [type, setType] = useState<SurveyType>("NPS");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState(DEFAULT_QUESTIONS.NPS.q);
  const [openQuestion, setOpenQuestion] = useState(DEFAULT_QUESTIONS.NPS.open);
  const [segments, setSegments] = useState("");
  const [products, setProducts] = useState("");
  const [channels, setChannels] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchType(t: SurveyType) {
    setType(t);
    setQuestion(DEFAULT_QUESTIONS[t].q);
    setOpenQuestion(DEFAULT_QUESTIONS[t].open);
  }

  function parseCSV(s: string) {
    return s.split(",").map(x => x.trim()).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("No estás logueada.");
      return;
    }
    const { data, error } = await supabase
      .from("surveys")
      .insert({
        owner_id: user.id,
        share_id: randomShareId(),
        name,
        type,
        industry: industry || null,
        question,
        open_question: openQuestion || null,
        segments: parseCSV(segments),
        products: parseCSV(products),
        channels: parseCSV(channels)
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/surveys/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-6">
      <div>
        <label className="block text-sm text-muted mb-2">Tipo de survey</label>
        <div className="grid grid-cols-3 gap-3">
          {(["NPS", "CSAT", "CES"] as SurveyType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={`p-4 rounded-lg border text-left transition ${
                type === t ? "border-accent bg-accent/10" : "border-border hover:border-muted"
              }`}
            >
              <div className="font-bold">{t}</div>
              <div className="text-xs text-muted mt-1">
                {t === "NPS" && "Lealtad · escala 0-10"}
                {t === "CSAT" && "Satisfacción · escala 1-5"}
                {t === "CES" && "Esfuerzo · escala 1-7"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1">Nombre interno</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: NPS Q2 Internet Fibra"
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Industria / vertical (opcional)</label>
          <input
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            placeholder="telco, retail, fintech, salud, SaaS..."
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Pregunta principal</label>
        <textarea
          required
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={2}
          className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Pregunta abierta (opcional)</label>
        <textarea
          value={openQuestion}
          onChange={e => setOpenQuestion(e.target.value)}
          rows={2}
          className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1">Segmentos (separados por coma)</label>
          <input
            value={segments}
            onChange={e => setSegments(e.target.value)}
            placeholder="B2C, B2B"
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Productos</label>
          <input
            value={products}
            onChange={e => setProducts(e.target.value)}
            placeholder="internet_fibra, movil_postpago"
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Canales</label>
          <input
            value={channels}
            onChange={e => setChannels(e.target.value)}
            placeholder="email, sms, in_app, call"
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {error && <div className="text-detractor text-sm">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="bg-accent text-black font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Creando..." : "Crear encuesta"}
      </button>
    </form>
  );
}
