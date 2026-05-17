import SurveyBuilder from "@/components/SurveyBuilder";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

export default async function NewSurveyPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen">
      <Header email={user?.email} />
      <main className="px-8 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Nueva encuesta</h1>
        <p className="text-muted mb-8">Elegí el tipo de survey y configurala. Después la compartís con un link.</p>
        <SurveyBuilder />
      </main>
    </div>
  );
}
