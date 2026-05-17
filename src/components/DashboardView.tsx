"use client";

import { Survey, Response } from "@/lib/types";
import { calcScore, calcNPS, npsCategory, groupByMonth } from "@/lib/metrics";
import { categorize, detectSentiment, themeColor } from "@/lib/sentiment";
import { npsBadge, csatBadge, cesBadge } from "@/lib/benchmarks";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

function KPI({ label, value, sub, badge, valueColor }: {
  label: string;
  value: string;
  sub?: string;
  badge?: { label: string; tone: "good" | "warn" | "bad" } | null;
  valueColor?: string;
}) {
  const toneClass = badge?.tone === "good"
    ? "bg-promoter/15 text-promoter"
    : badge?.tone === "warn"
    ? "bg-passive/15 text-passive"
    : badge?.tone === "bad"
    ? "bg-detractor/15 text-detractor"
    : "";
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted mb-2">{label}</div>
      <div className="text-4xl font-bold mb-1" style={valueColor ? { color: valueColor } : {}}>{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
      {badge && <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs ${toneClass}`}>{badge.label}</div>}
    </div>
  );
}

const COLORS = {
  promoter: "#22c55e",
  passive: "#fbbf24",
  detractor: "#ef4444",
  good: "#22c55e",
  warn: "#fbbf24",
  bad: "#ef4444"
};

export default function DashboardView({ survey, responses }: { survey: Survey; responses: Response[] }) {
  const score = calcScore(survey.type, responses);
  const badge = survey.type === "NPS" ? npsBadge(score)
              : survey.type === "CSAT" ? csatBadge(score)
              : cesBadge(score);

  const withComments = responses.filter(r => r.comment && r.comment.length > 5);

  // NPS distribution
  const npsDist = survey.type === "NPS"
    ? [
        { name: "Promotores (9-10)", value: responses.filter(r => npsCategory(r.score) === "promoter").length, color: COLORS.promoter },
        { name: "Pasivos (7-8)", value: responses.filter(r => npsCategory(r.score) === "passive").length, color: COLORS.passive },
        { name: "Detractores (0-6)", value: responses.filter(r => npsCategory(r.score) === "detractor").length, color: COLORS.detractor }
      ]
    : [];

  // Score distribution for CSAT/CES
  const scoreRange = survey.type === "CSAT" ? [1, 2, 3, 4, 5]
                   : survey.type === "CES" ? [1, 2, 3, 4, 5, 6, 7]
                   : [];
  const scoreDist = scoreRange.map(s => ({
    score: String(s),
    count: responses.filter(r => r.score === s).length
  }));

  // Evolution
  const months = groupByMonth(responses);
  const trend = Object.keys(months).sort().map(m => ({
    month: m,
    score: calcScore(survey.type, months[m])
  }));

  // Segment breakdown (only for NPS, but works for all)
  const segments = [...new Set(responses.map(r => r.segment).filter(Boolean) as string[])];
  const segmentData = segments.map(s => ({
    segment: s,
    score: calcScore(survey.type, responses.filter(r => r.segment === s))
  })).filter(x => x.score !== null);

  // Themes
  const themeCounts: Record<string, number> = {};
  const themeQuotes: Record<string, string> = {};
  for (const r of withComments) {
    const cats = categorize(r.comment);
    for (const c of cats) {
      themeCounts[c] = (themeCounts[c] || 0) + 1;
      if (!themeQuotes[c]) themeQuotes[c] = r.comment!;
    }
  }
  const themes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / Math.max(1, withComments.length)) * 100),
      quote: themeQuotes[name],
      color: themeColor(name)
    }));

  // Sentiment
  const sentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
  withComments.forEach(r => { sentCounts[detectSentiment(r.comment)]++; });
  const sentData = [
    { name: "Positivo", value: sentCounts.positive, color: COLORS.promoter },
    { name: "Neutro", value: sentCounts.neutral, color: "#8a96a3" },
    { name: "Negativo", value: sentCounts.negative, color: COLORS.detractor },
    { name: "Mixto", value: sentCounts.mixed, color: "#60a5fa" }
  ];

  const scoreColor = score === null ? undefined
    : badge?.tone === "good" ? COLORS.good
    : badge?.tone === "warn" ? COLORS.warn
    : COLORS.bad;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label={`${survey.type} Score`}
          value={score === null ? "—" : `${score}${survey.type !== "NPS" ? "%" : ""}`}
          sub={`${responses.length} respuestas`}
          badge={badge}
          valueColor={scoreColor}
        />
        <KPI
          label="Comentarios analizables"
          value={String(withComments.length)}
          sub={responses.length > 0 ? `${Math.round((withComments.length / responses.length) * 100)}% de respuestas` : ""}
        />
        <KPI
          label="Promotores / Detractores"
          value={survey.type === "NPS"
            ? `${responses.filter(r => npsCategory(r.score) === "promoter").length} / ${responses.filter(r => npsCategory(r.score) === "detractor").length}`
            : "—"}
          sub="Solo aplica a NPS"
        />
        <KPI
          label="Sentiment negativo"
          value={`${withComments.length > 0 ? Math.round((sentCounts.negative / withComments.length) * 100) : 0}%`}
          sub={`${sentCounts.negative} comentarios`}
        />
      </div>

      {/* Evolution + distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <div className="text-xs uppercase tracking-wider text-muted mb-3">Evolución del score</div>
          {trend.length === 0 ? (
            <div className="text-muted text-center py-12 text-sm">Sin data temporal todavía</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid stroke="#2d3640" />
                <XAxis dataKey="month" stroke="#8a96a3" />
                <YAxis stroke="#8a96a3" />
                <Tooltip contentStyle={{ background: "#1a2028", border: "1px solid #2d3640" }} />
                <Line type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted mb-3">
            {survey.type === "NPS" ? "Distribución NPS" : "Distribución de scores"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {survey.type === "NPS" ? (
              <PieChart>
                <Pie data={npsDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {npsDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a2028", border: "1px solid #2d3640" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            ) : (
              <BarChart data={scoreDist}>
                <CartesianGrid stroke="#2d3640" />
                <XAxis dataKey="score" stroke="#8a96a3" />
                <YAxis stroke="#8a96a3" />
                <Tooltip contentStyle={{ background: "#1a2028", border: "1px solid #2d3640" }} />
                <Bar dataKey="count" fill="#4ade80" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segments + sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted mb-3">Score por segmento</div>
          {segmentData.length === 0 ? (
            <div className="text-muted text-center py-12 text-sm">Sin segmentos definidos</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={segmentData}>
                <CartesianGrid stroke="#2d3640" />
                <XAxis dataKey="segment" stroke="#8a96a3" />
                <YAxis stroke="#8a96a3" />
                <Tooltip contentStyle={{ background: "#1a2028", border: "1px solid #2d3640" }} />
                <Bar dataKey="score" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted mb-3">Sentiment de comentarios</div>
          {withComments.length === 0 ? (
            <div className="text-muted text-center py-12 text-sm">Sin comentarios todavía</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {sentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a2028", border: "1px solid #2d3640" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Themes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted mb-3">Temas en respuestas abiertas</div>
        {themes.length === 0 ? (
          <div className="text-muted text-center py-12 text-sm">Sin temas detectados</div>
        ) : (
          <div className="space-y-2">
            {themes.slice(0, 12).map(t => (
              <div key={t.name} className="flex items-center gap-3">
                <div className="font-medium flex-1 min-w-[180px]">{t.name}</div>
                <div className="flex-[2] bg-elevated h-2.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ background: t.color, width: `${(t.count / themes[0].count) * 100}%` }} />
                </div>
                <div className="text-sm text-muted w-24 text-right">{t.count} ({t.pct}%)</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotes */}
      {themes.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted mb-3">Quotes destacadas</div>
          <div className="space-y-3">
            {themes.slice(0, 6).map(t => (
              <div key={t.name} className="bg-elevated rounded-lg p-3 border-l-4" style={{ borderColor: t.color }}>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: t.color }}>{t.name}</div>
                <div className="italic text-muted">"{t.quote}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
