"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { homeFor } from "@/lib/roles";
import { schoolContacts, schoolEmail } from "@/lib/contact";

const field =
  "w-full rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "suspended") {
      setError("Your account is suspended. Please contact the administrator.");
    } else if (params.get("error") === "unauthorized") {
      setError("You do not have permission to access the staff portal.");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError || !data.user) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role,status")
      .eq("email", (data.user.email ?? "").toLowerCase())
      .maybeSingle();

    if (!roleRow) {
      await supabase.auth.signOut();
      setError("Your account has no role assigned yet. Please contact the administrator.");
      setLoading(false);
      return;
    }

    if (roleRow.status === "suspended") {
      await supabase.auth.signOut();
      setError("Your account is suspended. Please contact the administrator.");
      setLoading(false);
      return;
    }

    router.push(homeFor(roleRow.role));
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="flex flex-col items-center bg-navy px-8 py-8">
          <Logo dark />
          <p className="mt-3 text-sm text-white/70">Digital Campus Login</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-8">
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-action">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="firstname.surname@jaligos.co.za"
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded bg-gold py-3 font-heading font-bold text-navy transition hover:bg-gold-dark disabled:opacity-70"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : "Log In"}
          </button>
          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-action hover:underline">Apply Now</Link>
          </p>
        </form>
        <details className="mx-6 mb-6 rounded-lg border border-gold/40 bg-navy/[0.03] sm:mx-8">
          <summary className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-navy hover:text-gold-dark">
            Need help? <span className="text-gold-dark underline underline-offset-2">Contact Support</span>
          </summary>
          <div className="space-y-3 border-t border-gold/20 px-4 py-4 text-center text-sm">
            <p className="text-slate-600">Call or WhatsApp us:</p>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
              {schoolContacts.map((contact) => (
                <a key={contact.number} href={`tel:${contact.tel}`} className="font-semibold text-navy underline decoration-gold underline-offset-2 hover:text-gold-dark">
                  {contact.number}
                </a>
              ))}
            </div>
            <a href={`mailto:${schoolEmail}`} className="inline-block max-w-full break-all font-semibold text-navy underline decoration-gold underline-offset-2 hover:text-gold-dark">
              {schoolEmail}
            </a>
          </div>
        </details>
      </div>
    </main>
  );
}
