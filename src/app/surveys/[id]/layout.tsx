import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SurveyLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: survey } = await supabase
    .from("surveys")
    .select("id, name, type, share_id, owner_id")
    .eq("id", params.id)
    .single();
  if (!survey || survey.owner_id !== user?.id) {
    notFound();
  }
  // After notFound(), TS still doesn't narrow — assert non-null
  const s = survey as { id: string; name: string; type: string; share_id: string; owner_id: string };
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/s/${s.share_id}`;

  return (
    <div className="min-h-screen">
      <Header email={user?.email} />
      <div className="max-w-7xl mx-auto px-8 pt-6">
        <Link href="/dashboard" className="text-sm text-muted hover:text-white">← Volver</Link>
        <div className="flex items-start justify-between mt-2 mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-accent font-semibold">{s.type}</span>
            <h1 className="text-2xl font-bold">{s.name}</h1>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-2">
            <div className="text-xs text-muted mb-0.5">Link público</div>
            <code className="text-xs">{shareUrl}</code>
          </div>
        </div>
        <nav className="flex gap-1 border-b border-border">
          <Link
            href={`/surveys/${params.id}`}
            className="px-4 py-2 text-sm border-b-2 border-transparent hover:border-muted"
          >
            Dashboard
          </Link>
          <Link
            href={`/surveys/${params.id}/loop`}
            className="px-4 py-2 text-sm border-b-2 border-transparent hover:border-muted"
          >
            Closing the loop
          </Link>
          <Link
            href={`/surveys/${params.id}/responses`}
            className="px-4 py-2 text-sm border-b-2 border-transparent hover:border-muted"
          >
            Respuestas
          </Link>
        </nav>
      </div>
      <main className="max-w-7xl mx-auto px-8 py-6">{children}</main>
    </div>
  );
}
