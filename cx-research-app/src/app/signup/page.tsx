"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">Revisá tu email</h1>
          <p className="text-muted">
            Te mandamos un link de confirmación. Hacé click ahí para activar tu cuenta y empezar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
        <p className="text-muted text-sm mb-6">
          ¿Ya tenés? <Link href="/login" className="text-accent hover:underline">Iniciá sesión</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>
          {error && <div className="text-detractor text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-semibold py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
