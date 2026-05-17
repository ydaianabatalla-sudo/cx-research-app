import { createClient } from "@/lib/supabase/server";
import { Survey, Response } from "@/lib/types";
import { notFound } from "next/navigation";
import DashboardView from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function SurveyDashboardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!survey) notFound();
  const { data: responses } = await supabase
    .from("responses")
    .select("*")
    .eq("survey_id", params.id)
    .order("created_at", { ascending: true });

  return <DashboardView survey={survey as Survey} responses={(responses ?? []) as Response[]} />;
}
