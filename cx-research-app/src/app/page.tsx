import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-8 py-6 border-b border-border flex items-center justify-between">
        <div className="text-xl font-bold">CX Research</div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg border border-border hover:bg-elevated text-sm">
            Iniciar sesión
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-lg bg-accent text-black font-semibold text-sm hover:opacity-90">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            La plataforma de surveys de CX que no te miente
          </h1>
          <p className="text-xl text-muted mb-10 leading-relaxed">
            Diseñá surveys de NPS, CSAT y CES en minutos. Compartilas con un link.
            Dashboards en vivo, análisis de sentiment automático y pipeline de
            closing the loop para detractores. Industry-agnostic.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-6 py-3 rounded-lg bg-accent text-black font-semibold hover:opacity-90">
              Empezar gratis
            </Link>
            <Link href="/login" className="px-6 py-3 rounded-lg border border-border hover:bg-elevated">
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-accent font-semibold mb-2">Surveys NPS · CSAT · CES</div>
              <div className="text-muted text-sm">
                Plantillas listas con preguntas validadas. Compartí con un link público en segundos.
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-accent font-semibold mb-2">Dashboards en vivo</div>
              <div className="text-muted text-sm">
                Score, evolución, segmentos, sentiment categorizado automáticamente.
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-accent font-semibold mb-2">Closing the loop</div>
              <div className="text-muted text-sm">
                Pipeline priorizado de detractores con acción y dueño sugerido para cada caso.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
