"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { homeFor } from "@/lib/roles";

const field =
  "w-full rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function ChangePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords do not match.");

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("email", (user?.email ?? "").toLowerCase())
      .maybeSingle();

    router.push(homeFor(roleRow?.role));
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F3EE] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="flex flex-col items-center bg-navy px-8 py-8">
          <Logo dark />
          <p className="mt-3 text-sm text-white/70">Change Your Password</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-8">
          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">New Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Confirm Password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded bg-action py-3 font-heading font-bold text-white transition hover:bg-gold-dark disabled:opacity-70"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
