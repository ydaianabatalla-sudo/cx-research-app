import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen">
      <Header email={user?.email} />
      <main className="px-8 py-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
