import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Survey } from "@/lib/types";
import PublicSurveyForm from "@/components/PublicSurveyForm";

export const dynamic = "force-dynamic";

export default async function PublicSurveyPage({ params }: { params: { shareId: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("share_id", params.shareId)
    .single();

  if (error || !data) notFound();
  const survey = data as Survey;
  if (survey.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Esta encuesta está cerrada</h1>
          <p className="text-muted">Gracias por tu interés.</p>
        </div>
      </div>
    );
  }

  return <PublicSurveyForm survey={survey} />;
}
