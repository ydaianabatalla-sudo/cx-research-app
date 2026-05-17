import Link from "next/link";

export default function Header({ email }: { email?: string | null }) {
  return (
    <header className="px-8 py-4 border-b border-border flex items-center justify-between bg-card">
      <Link href="/dashboard" className="text-lg font-bold">CX Research</Link>
      <div className="flex items-center gap-4">
        {email && <span className="text-sm text-muted">{email}</span>}
        <form action="/logout" method="post">
          <button className="text-sm px-3 py-1.5 border border-border rounded-lg hover:bg-elevated">
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
