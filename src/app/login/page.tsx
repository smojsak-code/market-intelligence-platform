"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } =
      mode === "sign_in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-vault-border bg-vault-panel p-8">
      <h1 className="mb-1 text-lg font-semibold">
        {mode === "sign_in" ? "Sign in" : "Create account"}
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Access your Intelligence Centre.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-vault-border bg-vault-bg px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-vault-border bg-vault-bg px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-vault-accent px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "sign_in" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button
        className="mt-4 text-xs text-slate-400 hover:text-slate-200"
        onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
      >
        {mode === "sign_in"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
